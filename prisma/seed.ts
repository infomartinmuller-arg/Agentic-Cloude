import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.alert.deleteMany();
  await prisma.eventResponsible.deleteMany();
  await prisma.document.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.providerPayment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.eventProvider.deleteMany();
  await prisma.event.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando usuarios...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Martín Müller",
      email: "admin@agentic.com",
      hashedPassword,
      role: "OWNER",
    },
  });

  const coordinator = await prisma.user.create({
    data: {
      name: "Laura García",
      email: "laura@agentic.com",
      hashedPassword,
      role: "COORDINATOR",
    },
  });

  const treasurer = await prisma.user.create({
    data: {
      name: "Carlos López",
      email: "carlos@agentic.com",
      hashedPassword,
      role: "TREASURER",
    },
  });

  const designer = await prisma.user.create({
    data: {
      name: "Ana Rodríguez",
      email: "ana@agentic.com",
      hashedPassword,
      role: "DESIGNER",
    },
  });

  const assistant = await prisma.user.create({
    data: {
      name: "Pedro Fernández",
      email: "pedro@agentic.com",
      hashedPassword,
      role: "ASSISTANT",
    },
  });

  console.log("Creando proveedores...");
  const provSonido = await prisma.provider.create({
    data: {
      name: "SoundMax Producciones",
      type: "tecnico",
      contactName: "Roberto Díaz",
      email: "roberto@soundmax.com",
      phone: "+54 11 4567 8901",
      city: "Buenos Aires",
      rating: 5,
    },
  });

  const provCatering = await prisma.provider.create({
    data: {
      name: "Sabores del Sur Catering",
      type: "catering",
      contactName: "María Elena",
      email: "info@saboresdelscatering.com",
      phone: "+54 11 2345 6789",
      city: "Buenos Aires",
      rating: 4,
    },
  });

  const artista1 = await prisma.provider.create({
    data: {
      name: "Los Fundamentalistas del Aire",
      type: "artista",
      contactName: "Manager Juan",
      email: "manager@losfundamentalistas.com",
      phone: "+54 11 9876 5432",
      city: "La Plata",
      rating: 5,
    },
  });

  const artista2 = await prisma.provider.create({
    data: {
      name: "DJ Electronika",
      type: "artista",
      contactName: "DJ Electro",
      email: "dj@electronika.com",
      phone: "+54 11 5555 1234",
      city: "Córdoba",
      rating: 4,
    },
  });

  const provSeguridad = await prisma.provider.create({
    data: {
      name: "Securitas Eventos",
      type: "seguridad",
      contactName: "Franco Segovia",
      email: "franco@securitas.com",
      phone: "+54 11 3333 4444",
      city: "Buenos Aires",
      rating: 4,
    },
  });

  const provLuces = await prisma.provider.create({
    data: {
      name: "LightShow Argentina",
      type: "tecnico",
      contactName: "Pablo Luz",
      email: "pablo@lightshow.com.ar",
      phone: "+54 11 7777 8888",
      city: "Rosario",
      rating: 5,
    },
  });

  const provFoto = await prisma.provider.create({
    data: {
      name: "Captura Visual",
      type: "fotografia",
      contactName: "Sofía Lens",
      email: "sofia@capturavisual.com",
      phone: "+54 11 6666 9999",
      city: "Buenos Aires",
      rating: 4,
    },
  });

  // ─── EVENTO 1: En producción, próximo (en 3 semanas) ─────
  console.log("Creando Evento 1: Festival de Verano...");
  const now = new Date();
  const event1Date = new Date(now);
  event1Date.setDate(now.getDate() + 21);

  const event1 = await prisma.event.create({
    data: {
      name: "Festival de Verano 2026",
      description: "Gran festival al aire libre con múltiples escenarios, food trucks y actividades.",
      venue: "Parque Centenario",
      city: "Buenos Aires",
      date: event1Date,
      endDate: new Date(event1Date.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: "EN_PRODUCCION",
      budget: 5000000,
      notes: "Evento principal del trimestre. Capacidad: 10,000 personas.",
      creatorId: admin.id,
    },
  });

  // Proveedores del evento 1
  await prisma.eventProvider.createMany({
    data: [
      { eventId: event1.id, providerId: artista1.id, role: "headliner", fee: 1500000, confirmed: true },
      { eventId: event1.id, providerId: artista2.id, role: "soporte", fee: 500000, confirmed: true },
      { eventId: event1.id, providerId: provSonido.id, role: "sonido principal", fee: 800000, confirmed: true },
      { eventId: event1.id, providerId: provLuces.id, role: "iluminación", fee: 600000, confirmed: false },
      { eventId: event1.id, providerId: provCatering.id, role: "catering VIP", fee: 400000, confirmed: true },
      { eventId: event1.id, providerId: provSeguridad.id, role: "seguridad", fee: 300000, confirmed: true },
      { eventId: event1.id, providerId: provFoto.id, role: "cobertura foto/video", fee: 200000, confirmed: false },
    ],
  });

  // Contratos del evento 1
  await prisma.contract.createMany({
    data: [
      { eventId: event1.id, title: "Contrato Headliner - Los Fundamentalistas", status: "FIRMADO", amount: 1500000, signDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
      { eventId: event1.id, title: "Contrato DJ Electronika", status: "FIRMADO", amount: 500000, signDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
      { eventId: event1.id, title: "Contrato SoundMax - Sonido", status: "ENVIADO", amount: 800000, dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      { eventId: event1.id, title: "Contrato LightShow - Luces", status: "PENDIENTE", amount: 600000, dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) },
    ],
  });

  // Pagos del evento 1
  const pago1 = await prisma.payment.create({
    data: {
      eventId: event1.id, concept: "Seña Headliner", amount: 750000,
      status: "COMPLETADO", method: "transferencia", paidDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.providerPayment.create({
    data: { paymentId: pago1.id, providerId: artista1.id },
  });

  const pago2 = await prisma.payment.create({
    data: {
      eventId: event1.id, concept: "Saldo Headliner", amount: 750000,
      status: "PENDIENTE", dueDate: new Date(event1Date.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.providerPayment.create({
    data: { paymentId: pago2.id, providerId: artista1.id },
  });

  const pago3 = await prisma.payment.create({
    data: {
      eventId: event1.id, concept: "Pago DJ Electronika", amount: 500000,
      status: "PENDIENTE", method: "transferencia",
      dueDate: new Date(event1Date.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.providerPayment.create({
    data: { paymentId: pago3.id, providerId: artista2.id },
  });

  await prisma.payment.create({
    data: {
      eventId: event1.id, concept: "Catering VIP - Total", amount: 400000,
      status: "PARCIAL", method: "efectivo",
      dueDate: new Date(event1Date.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.payment.create({
    data: {
      eventId: event1.id, concept: "Seguridad - Anticipo", amount: 150000,
      status: "COMPLETADO", method: "transferencia",
      paidDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  // Checklists del evento 1
  const cl1 = await prisma.checklist.create({
    data: {
      eventId: event1.id, title: "Producción General",
      items: {
        create: [
          { text: "Confirmar permisos municipales", completed: true, sortOrder: 1, completedAt: new Date() },
          { text: "Reservar ambulancia", completed: true, sortOrder: 2, completedAt: new Date() },
          { text: "Contratar seguro de evento", completed: false, sortOrder: 3, dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
          { text: "Instalar escenario principal", completed: false, sortOrder: 4, assignee: "Laura García" },
          { text: "Prueba de sonido", completed: false, sortOrder: 5, assignee: "SoundMax" },
          { text: "Coordinar estacionamiento", completed: false, sortOrder: 6 },
        ],
      },
    },
  });

  const cl2 = await prisma.checklist.create({
    data: {
      eventId: event1.id, title: "Comunicación y Marketing",
      items: {
        create: [
          { text: "Diseñar flyer oficial", completed: true, sortOrder: 1, completedAt: new Date() },
          { text: "Publicar en redes sociales", completed: true, sortOrder: 2, completedAt: new Date() },
          { text: "Enviar invitaciones VIP", completed: true, sortOrder: 3, completedAt: new Date() },
          { text: "Confirmar prensa acreditada", completed: false, sortOrder: 4 },
          { text: "Preparar kit de prensa", completed: false, sortOrder: 5, assignee: "Ana Rodríguez" },
        ],
      },
    },
  });

  // Documentos del evento 1
  await prisma.document.createMany({
    data: [
      { eventId: event1.id, name: "Contrato Headliner.pdf", type: "contrato", fileUrl: "/uploads/contrato-headliner.pdf" },
      { eventId: event1.id, name: "Rider Técnico - Los Fundamentalistas.pdf", type: "rider", fileUrl: "/uploads/rider-fundamentalistas.pdf" },
      { eventId: event1.id, name: "Plano de escenario v2.dwg", type: "plano", fileUrl: "/uploads/plano-escenario.dwg" },
      { eventId: event1.id, name: "Presupuesto catering.xlsx", type: "factura", fileUrl: "/uploads/presupuesto-catering.xlsx" },
    ],
  });

  // Responsables del evento 1
  await prisma.eventResponsible.createMany({
    data: [
      { eventId: event1.id, userId: admin.id, role: "director general" },
      { eventId: event1.id, userId: coordinator.id, role: "producción" },
      { eventId: event1.id, userId: treasurer.id, role: "finanzas" },
      { eventId: event1.id, userId: designer.id, role: "diseño y comunicación" },
    ],
  });

  // ─── EVENTO 2: Confirmado, en 2 meses ─────────────────
  console.log("Creando Evento 2: Gala Corporativa...");
  const event2Date = new Date(now);
  event2Date.setDate(now.getDate() + 55);

  const event2 = await prisma.event.create({
    data: {
      name: "Gala Corporativa TechCorp",
      description: "Cena de gala anual para 500 invitados con show en vivo.",
      venue: "Hotel Alvear Palace",
      city: "Buenos Aires",
      date: event2Date,
      status: "CONFIRMADO",
      budget: 3000000,
      notes: "Cliente premium. Exigen máxima calidad en todos los servicios.",
      creatorId: coordinator.id,
    },
  });

  await prisma.eventProvider.createMany({
    data: [
      { eventId: event2.id, providerId: provCatering.id, role: "catering principal", fee: 1200000, confirmed: true },
      { eventId: event2.id, providerId: provSonido.id, role: "sonido", fee: 400000, confirmed: false },
      { eventId: event2.id, providerId: provLuces.id, role: "iluminación", fee: 350000, confirmed: false },
      { eventId: event2.id, providerId: provFoto.id, role: "foto y video", fee: 250000, confirmed: true },
    ],
  });

  await prisma.contract.createMany({
    data: [
      { eventId: event2.id, title: "Contrato Hotel Alvear - Salón", status: "FIRMADO", amount: 800000, signDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
      { eventId: event2.id, title: "Contrato Catering", status: "ENVIADO", amount: 1200000, dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000) },
    ],
  });

  await prisma.payment.create({
    data: {
      eventId: event2.id, concept: "Reserva Hotel Alvear", amount: 400000,
      status: "COMPLETADO", method: "transferencia",
      paidDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.payment.create({
    data: {
      eventId: event2.id, concept: "Anticipo Catering", amount: 600000,
      status: "PENDIENTE",
      dueDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.checklist.create({
    data: {
      eventId: event2.id, title: "Logística Gala",
      items: {
        create: [
          { text: "Confirmar menú con cliente", completed: true, sortOrder: 1, completedAt: new Date() },
          { text: "Diseñar invitaciones", completed: false, sortOrder: 2, assignee: "Ana Rodríguez" },
          { text: "Armar lista de invitados", completed: false, sortOrder: 3 },
          { text: "Contratar DJ para after party", completed: false, sortOrder: 4 },
          { text: "Organizar transporte VIP", completed: false, sortOrder: 5 },
        ],
      },
    },
  });

  await prisma.document.create({
    data: {
      eventId: event2.id, name: "Propuesta Gala TechCorp.pdf", type: "otro",
      fileUrl: "/uploads/propuesta-gala.pdf",
    },
  });

  await prisma.eventResponsible.createMany({
    data: [
      { eventId: event2.id, userId: coordinator.id, role: "producción" },
      { eventId: event2.id, userId: treasurer.id, role: "finanzas" },
    ],
  });

  // ─── EVENTO 3: Borrador, en 4 meses ───────────────────
  console.log("Creando Evento 3: Expo Arte...");
  const event3Date = new Date(now);
  event3Date.setDate(now.getDate() + 120);

  const event3 = await prisma.event.create({
    data: {
      name: "Expo Arte Contemporáneo",
      description: "Exposición de arte contemporáneo con artistas nacionales e internacionales.",
      venue: "Centro Cultural Kirchner",
      city: "Buenos Aires",
      date: event3Date,
      endDate: new Date(event3Date.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: "BORRADOR",
      budget: 2000000,
      notes: "En etapa de planificación inicial. Pendiente confirmar artistas.",
      creatorId: admin.id,
    },
  });

  await prisma.checklist.create({
    data: {
      eventId: event3.id, title: "Planificación Inicial",
      items: {
        create: [
          { text: "Definir concepto curatorial", completed: false, sortOrder: 1 },
          { text: "Contactar artistas", completed: false, sortOrder: 2 },
          { text: "Negociar espacio con CCK", completed: false, sortOrder: 3 },
          { text: "Armar presupuesto detallado", completed: false, sortOrder: 4 },
        ],
      },
    },
  });

  await prisma.eventResponsible.create({
    data: {
      eventId: event3.id, userId: admin.id, role: "director artístico",
    },
  });

  // ─── GENERAR ALERTAS ──────────────────────────────────
  console.log("Generando alertas inteligentes...");

  // Importar y ejecutar el motor de alertas
  const { generateAlerts } = await import("../src/lib/alert-engine");
  const alertCount = await generateAlerts();
  console.log(`Se generaron ${alertCount} alertas.`);

  console.log("\n✅ Seed completado exitosamente!");
  console.log("────────────────────────────────────");
  console.log("Usuarios creados:");
  console.log("  admin@agentic.com / admin123 (Dueño)");
  console.log("  laura@agentic.com / admin123 (Coordinador)");
  console.log("  carlos@agentic.com / admin123 (Tesorero)");
  console.log("  ana@agentic.com / admin123 (Diseñador)");
  console.log("  pedro@agentic.com / admin123 (Asistente)");
  console.log("────────────────────────────────────");
  console.log("Eventos creados:");
  console.log("  1. Festival de Verano 2026 (En Producción - 3 semanas)");
  console.log("  2. Gala Corporativa TechCorp (Confirmado - 2 meses)");
  console.log("  3. Expo Arte Contemporáneo (Borrador - 4 meses)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
