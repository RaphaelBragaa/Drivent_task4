import BookingRepository from "@/repositories/booking-repository";
import { listHotels } from "../hotels-service";
import { notFoundError, requestedResourceForbiddenError } from "@/errors";

async function getBooking(userId: number) {
  const result = BookingRepository.FindBookingById(userId);
  if(!result) {
    throw notFoundError;
  }
  return result;
}

async function postBooking(roomId: number, userId: number) {
  const room = BookingRepository.FindRoomById(roomId);
  if(!room) {
    throw notFoundError;
  }
  if((await room).capacity === (await room).Booking.length) {
    throw requestedResourceForbiddenError;
  }
  const booking = {
    userId,
    roomId
  };

  await BookingRepository.InsertBooking(booking);
}

async function putBooking(roomId: number, userId: number) {
  await listHotels(userId);
  const result = BookingRepository.FindBookingById(userId);
  if(!result) {
    throw notFoundError;
  }
  const room = BookingRepository.FindRoomById(roomId);
  if(!room) {
    throw notFoundError;
  }
  if((await room).capacity === (await room).Booking.length) {
    throw requestedResourceForbiddenError;
  }
  const booking = {
    userId,
    roomId
  };
  await BookingRepository.DeleteBooking((await result).id);
  await BookingRepository.InsertBooking(booking);
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
