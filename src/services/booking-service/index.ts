import BookingRepository from "@/repositories/booking-repository";
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

//async function putBooking(roomId: number) {
//}

const bookingService = {
  getBooking,
  postBooking,
  //putBooking
};

export default bookingService;
