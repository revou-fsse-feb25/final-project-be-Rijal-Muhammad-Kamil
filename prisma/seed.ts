import { PrismaClient, Role, Gender, UserStatus, EventStatus, PeriodStatus, TicketStatus } from '@prisma/client';
import { AttendeeUser, OrganizerUser } from './interface';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.ticket.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.ticketTypeCategory.deleteMany();
  await prisma.eventPeriod.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.eventOrganizer.deleteMany();
  await prisma.user.deleteMany();

  // Ticket type categories
  const ticketTypeCategories = await Promise.all(
    ['Regular', 'VIP', 'VVIP', 'Early Bird', 'Student'].map(name =>
      prisma.ticketTypeCategory.create({ data: { name } })
    )
  );

  // Event categories
  const eventCategories = await Promise.all(
    ['Music', 'Sports', 'Arts', 'Technology', 'Business', 'Food', 'Education', 'Health', 'Exhibition'].map(name =>
      prisma.eventCategory.create({ data: { name } })
    )
  );

  // Create 2 attendees
  const attendeeUsers: AttendeeUser[] = [];
  for (let i = 0; i < 2; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const gender = faker.helpers.arrayElement(['Male', 'Female']) as Gender;
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        password: hashedPassword,
        role: Role.ATTENDEE,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender,
        phone_number: `08${faker.string.numeric(10)}`,
        status: UserStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    attendeeUsers.push(user);
  }

  // Create 10 organizers
  const organizerUsers: OrganizerUser[] = [];
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const gender = faker.helpers.arrayElement(['Male', 'Female']) as Gender;
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        password: hashedPassword,
        role: Role.EVENT_ORGANIZER,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        gender,
        phone_number: `08${faker.string.numeric(10)}`,
        status: UserStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const organizer = await prisma.eventOrganizer.create({
      data: {
        user_id: user.user_id,
        name: `${firstName} ${lastName} Events`,
        image_url: faker.image.urlLoremFlickr({ category: 'business' }) ?? 'https://via.placeholder.com/150',
      },
    });

    organizerUsers.push({ user, organizer });
  }

  // Create 5 events per organizer
  for (const { organizer } of organizerUsers) {
    for (let i = 0; i < 5; i++) {
      const eventCategory = faker.helpers.arrayElement(eventCategories);

      const event = await prisma.event.create({
        data: {
          category_id: eventCategory.category_id,
          organizer_id: organizer.organizer_id,
          title: faker.company.catchPhrase(),
          description: faker.lorem.paragraphs(3),
          terms: faker.lorem.paragraphs(2),
          location: faker.location.city(),
          image_url: faker.image.urlLoremFlickr({ category: 'event' }) ?? 'https://via.placeholder.com/150',
          status: EventStatus.active,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // 2 periods per event
      for (let j = 0; j < 2; j++) {
        const startDate = faker.date.future({ years: 1 });
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 3 }));

        const startTime = new Date();
        startTime.setHours(faker.number.int({ min: 8, max: 18 }), 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + faker.number.int({ min: 2, max: 6 }));

        const period = await prisma.eventPeriod.create({
          data: {
            event_id: event.event_id,
            name: `Period ${j + 1}`,
            start_date: startDate,
            end_date: endDate,
            start_time: startTime,
            end_time: endTime,
            status: PeriodStatus.upcoming,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // 2 ticket types per period
        for (let k = 0; k < 2; k++) {
          const ticketCategory = faker.helpers.arrayElement(ticketTypeCategories);
          const price = faker.number.float({ min: 50000, max: 1000000, fractionDigits: 2 });
          const hasDiscount = faker.datatype.boolean();
          const discount = hasDiscount ? price * faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 2 }) : null;

          const ticketType = await prisma.ticketType.create({
            data: {
              period_id: period.period_id,
              category_id: ticketCategory.category_id,
              price,
              discount,
              quota: faker.number.int({ min: 50, max: 500 }),
              status: TicketStatus.available,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });

          // Tickets purchased by attendees (0-2 per ticket type)
          const purchaseCount = faker.number.int({ min: 0, max: 2 });
          for (let t = 0; t < purchaseCount; t++) {
            const attendee = faker.helpers.arrayElement(attendeeUsers);
            await prisma.ticket.create({
              data: {
                type_id: ticketType.type_id,
                buyer_id: attendee.user_id,
                ticket_code: faker.string.alphanumeric(10).toUpperCase(),
                created_at: new Date(),
              },
            });
          }
        }
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
