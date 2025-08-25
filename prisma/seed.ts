import { PrismaClient, Role, Gender, UserStatus, EventStatus, PeriodStatus, TicketStatus, TRANSACTION_STATUS, PAYMENT_METHOD, User, EventOrganizer, TicketType, Ticket } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  await prisma.ticket.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.eventPeriod.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.eventOrganizer.deleteMany();
  await prisma.user.deleteMany();

  const eventCategories = await Promise.all(
    ['Music', 'Sports', 'Arts', 'Tech', 'Business'].map(name =>
      prisma.eventCategory.create({ data: { name } })
    )
  );

  const ticketTypeCategories = await Promise.all(
    ['Regular', 'VIP', 'VVIP', 'Early Bird', 'Student'].map(name =>
      prisma.ticketTypeCategory.create({ data: { name } })
    )
  );

  const attendeeUsers: User[] = [];
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        password: hashedPassword,
        role: Role.ATTENDEE,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }).toISOString().split('T')[0],
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE']) as Gender,
        phone_number: `08${faker.string.numeric(10)}`,
        status: UserStatus.ACTIVE,
      },
    });
    attendeeUsers.push(user);
  }

  const organizerUsers: { user: User; organizer: EventOrganizer }[] = [];
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        password: hashedPassword,
        role: Role.EVENT_ORGANIZER,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }).toISOString().split('T')[0],
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE']) as Gender,
        phone_number: `08${faker.string.numeric(10)}`,
        status: UserStatus.ACTIVE,
      },
    });

    const organizer = await prisma.eventOrganizer.create({
      data: {
        user_id: user.user_id,
        name: `${firstName} ${lastName} Events`,
        address: faker.location.streetAddress({ useFullAddress: true }),
        description: faker.company.catchPhrase(),
        logo_url: faker.image.urlLoremFlickr({ category: 'business' }) ?? 'https://via.placeholder.com/150',
      },
    });

    organizerUsers.push({ user, organizer });
  }

  const allTicketTypes: TicketType[] = [];
  const allTickets: Ticket[] = [];

  for (const { organizer } of organizerUsers) {
    for (let e = 0; e < 5; e++) {
      const category = faker.helpers.arrayElement(eventCategories);

      const event = await prisma.event.create({
        data: {
          category_id: category.category_id,
          organizer_id: organizer.organizer_id,
          title: faker.company.catchPhrase(),
          description: faker.lorem.paragraphs(2),
          terms: faker.lorem.paragraphs(1),
          location: faker.location.city(),
          image_url: faker.image.urlLoremFlickr({ category: 'event' }) ?? 'https://via.placeholder.com/150',
          status: EventStatus.ACTIVE,
        },
      });

      for (let p = 0; p < 2; p++) {
        const startDate = faker.date.future({ years: 1 });
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 3 }));

        const period = await prisma.eventPeriod.create({
          data: {
            event_id: event.event_id,
            name: `Period ${p + 1}`,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            start_time: `${faker.number.int({ min: 8, max: 18 })}:00:00`,
            end_time: `${faker.number.int({ min: 19, max: 23 })}:00:00`,
            status: PeriodStatus.UPCOMING,
          },
        });

        for (let t = 0; t < 2; t++) {
          const ticketCategory = faker.helpers.arrayElement(ticketTypeCategories);
          const price = faker.number.float({ min: 50000, max: 500000, fractionDigits: 2 });

          const ticketType = await prisma.ticketType.create({
            data: {
              period_id: period.period_id,
              category_id: ticketCategory.category_id,
              price,
              discount: faker.datatype.boolean() ? price * faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 2 }) : null,
              quota: faker.number.int({ min: 50, max: 200 }),
              status: TicketStatus.AVAILABLE,
            },
          });

          allTicketTypes.push(ticketType);

          for (let i = 0; i < ticketType.quota; i++) {
            const ticket = await prisma.ticket.create({
              data: {
                type_id: ticketType.type_id,
                ticket_code: faker.string.alphanumeric(10).toUpperCase(),
              },
            });
            allTickets.push(ticket);
          }
        }
      }
    }
  }

  const ticketsToAssignCount = Math.ceil(allTickets.length * 0.01);
  for (let i = 0; i < ticketsToAssignCount; i++) {
    const attendee = faker.helpers.arrayElement(attendeeUsers);
    const ticket = allTickets[i];
    const ticketType = allTicketTypes.find(tt => tt.type_id === ticket.type_id);
    
    if (ticketType) {
      const finalPrice = Number(ticketType.price) - Number(ticketType.discount || 0);
      
      await prisma.transaction.create({
        data: {
          user_id: attendee.user_id,
          total_price: finalPrice,
          status: TRANSACTION_STATUS.SUCCESS,
          payment_method: faker.helpers.arrayElement(Object.values(PAYMENT_METHOD)),
          tickets: {
            connect: { ticket_id: ticket.ticket_id },
          },
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
