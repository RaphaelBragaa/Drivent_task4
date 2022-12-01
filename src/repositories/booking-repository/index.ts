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

async function InsertBooking(booking: BookingParams) {
  return prisma.booking.create({
    data: {
      ...booking
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

async function FindRoomById(roomId: number) {
  return prisma.room.findUnique({
    where: {
      id: roomId,
    },
    include: {
      Booking: true
    }
  });
}

export type BookingParams = Omit<Booking, "id"  | "createdAt" | "updatedAt">

const BookingRepository ={
  FindBookingById,
  InsertBooking,
  DeleteBooking,
  FindRoomById
};

export default BookingRepository;
