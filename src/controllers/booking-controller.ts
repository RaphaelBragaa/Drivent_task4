import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try{
    const reserveList = bookingService.getBooking(Number(userId));
    return res.status(httpStatus.OK).send(reserveList);
  }catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.params;
  try{
    await bookingService.postBooking(Number(roomId), Number(userId));
    const bookingId = bookingService.getBooking(Number(userId));
    return res.status(httpStatus.OK).send((await bookingId).id);
  } catch(error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "requestedResourceisForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.params;
  try{
    await bookingService.putBooking(Number(roomId), Number(userId));
    const bookingId = bookingService.getBooking(Number(userId));
    return res.status(httpStatus.OK).send((await bookingId).id);
  }catch(error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "requestedResourceisForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
