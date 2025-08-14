import { PrismaClient } from '@prisma/client';
import { Gender, Role, EventStatus, PeriodStatus, TicketTypeName, TicketTypeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.ticket.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.eventPeriod.deleteMany();
  await prisma.eventTerms.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.eventOrganizer.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create Event Categories
  const categories = await Promise.all([
    prisma.eventCategory.create({
      data: {
        name: 'Konser Musik',
      },
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Seminar & Workshop',
      },
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Olahraga',
      },
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Festival',
      },
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Pameran',
      },
    }),
  ]);

  console.log('Created event categories');

  // Create 1 ATTENDEE user
  const attendeeUser = await prisma.user.create({
    data: {
      email: 'attendee@example.com',
      profile: {
        create: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: new Date('1990-01-15'),
          gender: Gender.MALE,
          phone_number: '+628123456789',
          password: await bcrypt.hash('password123', 10),
          role: Role.ATTENDEE,
        },
      },
    },
  });

  console.log('Created attendee user');

  // Create 10 EVENT_ORGANIZER users with events
  for (let i = 1; i <= 10; i++) {
    const organizerUser = await prisma.user.create({
      data: {
        email: `organizer${i}@example.com`,
        profile: {
          create: {
            first_name: `Organizer`,
            last_name: `Ke ${i}`,
            date_of_birth: new Date(`198${i % 10}-0${(i % 9) + 1}-${10 + i}`),
            gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
            phone_number: `+62812345678${i.toString().padStart(2, '0')}`,
            password: await bcrypt.hash(`organizer${i}password`, 10),
            role: Role.EVENT_ORGANIZER,
          },
        },
        organizer: {
          create: {
            name: `Event Organizer ${i}`,
          },
        },
      },
      include: {
        organizer: true,
      },
    });

    // Create 3 events for each organizer
    for (let j = 1; j <= 3; j++) {
      const eventIndex = (i - 1) * 3 + j;
      const categoryIndex = (eventIndex - 1) % categories.length;
      
      const event = await prisma.event.create({
        data: {
          category_id: categories[categoryIndex].category_id,
          organizer_id: organizerUser.organizer!.organizer_id,
          title: `Event ${eventIndex} - ${categories[categoryIndex].name}`,
          description: `Deskripsi lengkap untuk Event ${eventIndex}. Event ini akan memberikan pengalaman yang tak terlupakan bagi semua peserta. Dengan berbagai aktivitas menarik dan pembicara berkualitas.`,
          location: `Venue ${eventIndex}, Jakarta`,
          image_url: `https://example.com/images/event${eventIndex}.jpg`,
          status: EventStatus.ACTIVE,
        },
      });

      // Create Event Terms
      await prisma.eventTerms.create({
        data: {
          event_id: event.event_id,
          description: `Syarat dan ketentuan untuk Event ${eventIndex}:\n1. Peserta wajib membawa identitas diri\n2. Dilarang membawa makanan dan minuman dari luar\n3. Peserta wajib mematuhi protokol kesehatan\n4. Tiket tidak dapat dikembalikan\n5. Panitia berhak menolak peserta yang tidak memenuhi syarat`,
        },
      });

      // Create 2 Event Periods for each event
      for (let k = 1; k <= 2; k++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (eventIndex * 7) + (k * 2));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const period = await prisma.eventPeriod.create({
          data: {
            event_id: event.event_id,
            name: `Periode ${k}`,
            period_sequence: k,
            start_date: startDate,
            end_date: endDate,
            start_time: new Date(`1970-01-01T${k === 1 ? '09:00:00' : '14:00:00'}.000Z`),
            end_time: new Date(`1970-01-01T${k === 1 ? '12:00:00' : '17:00:00'}.000Z`),
            capacity: 500 + (k * 100),
            status: PeriodStatus.UPCOMING,
          },
        });

        // Create 3 Ticket Types for each period
        const ticketTypes = [
          {
            name: TicketTypeName.EARLY_BIRD,
            price: 50000 + (eventIndex * 10000),
            discount: 20.00,
            quota: 50,
          },
          {
            name: TicketTypeName.REGULAR,
            price: 75000 + (eventIndex * 10000),
            discount: 0.00,
            quota: 300,
          },
          {
            name: TicketTypeName.VIP,
            price: 150000 + (eventIndex * 10000),
            discount: 0.00,
            quota: 100,
          },
        ];

        for (const ticketTypeData of ticketTypes) {
          const ticketType = await prisma.ticketType.create({
            data: {
              period_id: period.period_id,
              name: ticketTypeData.name,
              price: ticketTypeData.price,
              discount: ticketTypeData.discount,
              quota: ticketTypeData.quota,
              status: TicketTypeStatus.AVAILABLE,
            },
          });

          // Create some tickets for each ticket type
          const ticketCount = Math.floor(ticketTypeData.quota * 0.3); // 30% of quota
          for (let l = 1; l <= ticketCount; l++) {
            await prisma.ticket.create({
              data: {
                type_id: ticketType.type_id,
                buyer_id: Math.random() > 0.7 ? attendeeUser.user_id : null, // 30% chance to be bought by attendee
                ticket_code: `TKT-${event.event_id}-${period.period_id}-${ticketType.type_id}-${l.toString().padStart(3, '0')}`,
              },
            });
          }
        }
      }
    }

    console.log(`Created organizer ${i} with 3 events`);
  }

  console.log('Database seeding completed successfully!');
  console.log('Summary:');
  console.log('- 11 users (1 attendee + 10 organizers)');
  console.log('- 5 event categories');
  console.log('- 30 events (3 per organizer)');
  console.log('- 60 event periods (2 per event)');
  console.log('- 180 ticket types (3 per period)');
  console.log('- ~1620 tickets (30% of total quota)');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
