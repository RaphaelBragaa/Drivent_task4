import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import{
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createBooking

} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { prisma } from "@/config";
import BookingRepository from "@/repositories/booking-repository";

beforeAll(async () => {
  await init();
});
  
beforeEach(async () => {
  await cleanDb();
});
  
const server = supertest(app);

async function CreateMaxBookingByRoom(room: number) {
  const user1 = await createUser();
  const user2 = await createUser();
  const user3 = await createUser();
  const booking1 = {
    roomId: room,
    userId: user1.id
  };
  const booking2 = {
    roomId: room,
    userId: user2.id
  };
  const booking3 = {
    roomId: room,
    userId: user3.id
  };
  await BookingRepository.InsertBooking(booking1);
  await BookingRepository.InsertBooking(booking2);
  await BookingRepository.InsertBooking(booking3);
}

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when token is valid", () => {
    it("should with status 200 and list the user's booking ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(room.id, user.id);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`); 
    
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        }
      });
    });
    it("should respond 404 when user has no reservation ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
     
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`); 
    
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
});
describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking/1");
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
      
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
      
    const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
      
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      
    const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when token is valid", () => {
    it("should return status code 200 with bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      const bookings = await BookingRepository.FindBookingById(user.id);
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: bookings.id });
    });
    it("should respond with status 403 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("must respond with status 400 when request has no body ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send();

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
    it("should respond with status 404 when not finding roomId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const body = { roomId: 1 };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("must respond with status 403 when there is no vacancy in the room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await CreateMaxBookingByRoom(room.id);

      const body = { roomId: room.id };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond status code 200 with bookingId", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(room.id, user.id);

    const body = { roomId: room.id };

    const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
    const bookings = await BookingRepository.FindBookingById(user.id);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({ bookingId: bookings.id });
  });
});
