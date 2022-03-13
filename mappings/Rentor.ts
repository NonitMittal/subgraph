import {BigInt} from "@graphprotocol/graph-ts";
import {
    BookReturned,
    BookPutOnRent,
    BookRemovedFromRent,
    BookTakenOnRent
} from "../generated/Rentor/Rentor";
import {RentRecord, Copy} from "../generated/schema";

export function handleBookPutOnRent(event: BookPutOnRent): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toHex());
    if (copy) {
        copy.onRent = true;
        copy.flowRate = event.params.flowRate;
        copy.save();
    }
}

export function handleBookRemoveFromRent(event: BookRemovedFromRent): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toHex());
    if (copy) {
        copy.onRent = false;
        copy.flowRate = new BigInt(0);
        copy.save();
    }
}

export function handleBookTakenOnRent(event: BookTakenOnRent): void {
    const rentRecordId =
        event.params.copyUid.toString() +
        event.params.editionAddress.toHex() +
        event.block.timestamp.toString();
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toHex());
    if (copy) {
        let rentRecord = RentRecord.load(rentRecordId);
        if (!rentRecord) {
            rentRecord = new RentRecord(rentRecordId);
            rentRecord.copyId = event.params.copyUid;
            rentRecord.edition = event.params.editionAddress.toHex();
            rentRecord.flowRate = event.params.flowRate;
            rentRecord.rentedTo = event.params.rentedTo.toHex();
            rentRecord.rentedFrom = copy.owner;
            rentRecord.rentStartDate = event.block.timestamp;
            rentRecord.save();
        }
        copy.rentRecord = rentRecordId;
        copy.save();
    }
}

export function handleBookReturned(event: BookReturned): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toHex());
    if (copy) {
        let rentRecord = RentRecord.load(copy.rentRecord!);
        if (rentRecord) {
            rentRecord.rentEndDate = event.block.timestamp;
            rentRecord.save();
            copy.rentRecord = null;
            copy.save;
        }
    }
}
