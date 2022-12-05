import BookingRepository from "@/repositories/booking-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { notFoundError, requestedResourceForbiddenError, unauthorizedError } from "@/errors";

async function listHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw requestedResourceForbiddenError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw unauthorizedError();
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
  if (room.capacity - capacity <= 0) {
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
    throw notFoundError();
  }
  const room = await BookingRepository.FindRoomById(roomId);
  if(!room) {
    throw notFoundError();
  }
  const capacity = await BookingRepository.CountReservationByRoom(roomId);
  if (room.capacity - capacity <= 0) {
    throw requestedResourceForbiddenError();
  }
  const booking = {
    userId,
    roomId
  };
  await BookingRepository.DeleteBooking(result.id);
  const view = await BookingRepository.InsertBooking(booking);
  return view;
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
