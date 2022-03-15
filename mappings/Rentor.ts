import {BigInt, log, store} from "@graphprotocol/graph-ts";
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
        const rentRecordId =
            event.params.copyUid.toString() +
            event.params.editionAddress.toHex() +
            event.block.timestamp.toString();
        const rentRecord = new RentRecord(rentRecordId);
        rentRecord.copyUid = event.params.copyUid;
        rentRecord.edition = event.params.editionAddress.toHex();
        rentRecord.flowRate = event.params.flowRate;
        rentRecord.rentedFrom = copy.owner;
        rentRecord.save();
        copy.onRent = true;
        copy.flowRate = event.params.flowRate;
        copy.rentRecord = rentRecordId;
        copy.save();
    }
}

export function handleBookRemoveFromRent(event: BookRemovedFromRent): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toHex());
    if (copy) {
        let rentRecord = RentRecord.load(copy.rentRecord!);
        if (rentRecord) {
            if (!rentRecord.rentedTo) {
                store.remove("RentRecord", copy.rentRecord!);
            }
            copy.onRent = false;
            copy.flowRate = BigInt.fromString("0");
            copy.rentRecord = null;
            copy.save;
        }
    }
}

export function handleBookTakenOnRent(event: BookTakenOnRent): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toHex());
    if (copy) {
        const rentRecord = RentRecord.load(copy.rentRecord!);
        if (rentRecord) {
            rentRecord.rentedTo = event.params.rentedTo.toHex();
            rentRecord.rentStartDate = event.block.timestamp;
            rentRecord.save();
        }
    }
}

export function handleBookReturned(event: BookReturned): void {
    let copy = Copy.load(event.params.copyUid.toString() + event.params.editionAddress.toHex());
    if (copy) {
        let rentRecord = RentRecord.load(copy.rentRecord!);
        if (rentRecord) {
            rentRecord.rentEndDate = event.block.timestamp;
            rentRecord.save();
            const rentRecordId =
                event.params.copyUid.toString() +
                event.params.editionAddress.toHex() +
                event.block.timestamp.toString();
            rentRecord = new RentRecord(rentRecordId);
            rentRecord.copyUid = event.params.copyUid;
            rentRecord.edition = event.params.editionAddress.toHex();
            rentRecord.flowRate = copy.flowRate;
            rentRecord.rentedFrom = copy.owner;
            rentRecord.save();
            copy.rentRecord = rentRecordId;
            copy.save;
        }
    }
}
