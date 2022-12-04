import BookingRepository from "@/repositories/booking-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { notFoundError, requestedResourceForbiddenError } from "@/errors";

async function listHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw requestedResourceForbiddenError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw requestedResourceForbiddenError();
  }
}

async function getBooking(userId: number) {
  const result = await BookingRepository.FindBookingById(userId);
  if(!result) {
    throw notFoundError;
  }
  return result;
}

async function postBooking(roomId: number, userId: number) {
  await listHotels(userId);
  const room = await BookingRepository.FindRoomById(roomId);
  if(!room) {
    throw notFoundError();
  }
  const capacity = await BookingRepository.CountReservationByRoom(roomId);
  if (room.capacity - capacity === 0) {
    throw requestedResourceForbiddenError();
  }
  const booking = {
    userId,
    roomId
  };

  const result = await BookingRepository.InsertBooking(booking);
  return result;
}

async function putBooking(roomId: number, userId: number) {
  await listHotels(userId);
  const result = await BookingRepository.FindBookingById(userId);
  if(!result) {
    throw notFoundError;
  }
  const room = await BookingRepository.FindRoomById(roomId);
  if(!room) {
    throw notFoundError;
  }
  const capacity = await BookingRepository.CountReservationByRoom(roomId);
  if (room.capacity - capacity === 0) {
    throw requestedResourceForbiddenError();
  }
  const booking = {
    userId,
    roomId
  };
  await BookingRepository.DeleteBooking(result.id);
  await BookingRepository.InsertBooking(booking);
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
