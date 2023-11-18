const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const locationsList = [
  { latitude: 40.7128, longitude: -74.006 },
  { latitude: 40.9, longitude: -74.307 },
  { latitude: 40.6032, longitude: -74.5005 },
  { latitude: 41.1057, longitude: -74.7024 },
  { latitude: 40.7895, longitude: -73.8183 },
  { latitude: 41.165, longitude: -73.9328 },
  { latitude: 40.6956, longitude: -74.1721 },
  { latitude: 41.0123, longitude: -74.3876 },
  { latitude: 40.8524, longitude: -73.7002 },
  { latitude: 41.2389, longitude: -73.8247 },
  { latitude: 40.7274, longitude: -74.2185 },
  { latitude: 41.0447, longitude: -74.434 },
  { latitude: 40.9256, longitude: -73.6465 },
  { latitude: 41.3221, longitude: -73.761 },
  { latitude: 40.7493, longitude: -74.3914 },
  { latitude: 41.0869, longitude: -74.6069 },
  { latitude: 40.9782, longitude: -73.5188 },
  { latitude: 41.3747, longitude: -73.6333 },
  { latitude: 40.7712, longitude: -74.1062 },
  { latitude: 41.1878, longitude: -74.3217 },
];

async function main() {
  const db = new PrismaClient();
  const user = await db.user.create({
    data: {
      name: "Test",
      username: "test",
      password: await hash("12345", 10),
    },
  });

  for (const { latitude, longitude } of locationsList) {
    const location = await db.location.create({
      data: {
        lat: latitude,
        lng: longitude,
      },
    });
    await db.channel.create({
      data: {
        name: `Channel (${latitude}, ${longitude})`,
        adminId: user.id,
        locationId: location.id,
      },
    });
  }
}

main().then(() => {
  console.log("Seeding Complete!")
});
