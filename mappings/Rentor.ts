import {BigInt} from "@graphprotocol/graph-ts";
import {
    BookReturned,
    BookPutOnRent,
    BookRemovedFromRent,
    BookTakenOnRent
} from "../generated/Rentor/Rentor";
import {RentRecord, Copy} from "../generated/schema";

export function handleBookPutOnRent(event: BookPutOnRent): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toString());
    if (copy) {
        copy.onRent = true;
        copy.flowRate = event.params.flowRate;
        copy.save();
    }
}

export function handleBookRemoveFromRent(event: BookRemovedFromRent): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toString());
    if (copy) {
        copy.onRent = false;
        copy.flowRate = new BigInt(0);
        copy.save();
    }
}

export function handleBookTakenOnRent(event: BookTakenOnRent): void {
    const rentRecordId =
        event.params.copyUid.toString() +
        event.params.editionAddress.toString() +
        event.block.timestamp.toString();
    let rentRecord = RentRecord.load(rentRecordId);
    if (!rentRecord) {
        rentRecord = new RentRecord(rentRecordId);
        rentRecord.copyId = event.params.copyUid;
        rentRecord.edition = event.params.editionAddress.toString();
        rentRecord.flowRate = event.params.flowRate;
        rentRecord.rentedTo = event.params.rentedTo;
        rentRecord.rentStartDate = event.block.timestamp;
        rentRecord.save();
        let copy = Copy.load(
            event.params.copyUid.toString() + event.params.editionAddress.toString()
        );
        copy.rentRecord = rentRecordId;
        copy.save();
    }
}

export function handleBookReturned(event: BookReturned): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toString());
    if (copy) {
        let rentRecord = RentRecord.load(copy.rentRecord);
        rentRecord.rentEndDate = event.block.timestamp;
        rentRecord.save();
        copy.rentRecord = null;
        copy.save;
    }
}
