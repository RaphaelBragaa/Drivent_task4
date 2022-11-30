import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function FindBookingById(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true
    }, 
  });
}

async function InsertBooking(roomId: number, params: BookingParams) {
  return prisma.booking.create({
    data: {
      roomId,
      ...params,
    }
  });
}

async function DeleteBooking(BookingId: number) {
  return prisma.booking.delete({
    where: {
      id: BookingId,
    },
  });
}

export type BookingParams = Omit<Booking, "id"  | "createdAt" | "updatedAt">

const BookingRepository ={
  FindBookingById,
  InsertBooking,
  DeleteBooking
};

export default BookingRepository;
