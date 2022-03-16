import {Bytes, dataSource, BigInt, log} from "@graphprotocol/graph-ts";
import {
    BookBought,
    BookTransferred,
    PriceUpdated,
    MarketSupplyIncreased,
    SupplyLimited,
    SupplyUnlimited,
    RoyaltyUpdated,
    BookRedeemed,
    RevenueWithdrawn,
    BookLocked,
    BookUnlocked,
    ContributorAdded
} from "../generated/templates/Edition/Edition";
import {
    Book,
    Edition,
    Copy,
    DistributedCopy,
    Contribution,
    ContributorProfile,
    ReaderProfile,
    TransferRecord,
    BuyRecord
} from "../generated/schema";

// BookBought(uint256 copyUid, address indexed buyer, uint256 price);
// handleBookBought
export function handleBookBought(event: BookBought): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);

    if (edition) {
        let book = Book.load(edition.bookId.toString());
        let copy = Copy.load(event.params.copyUid.toString() + editionAddress);
        if (!copy && book) {
            let reader = ReaderProfile.load(event.params.buyer.toHex());
            if (!reader) {
                reader = new ReaderProfile(event.params.buyer.toHex());
                reader.save();
            }

            let newCopy = new Copy(event.params.copyUid.toString() + editionAddress);
            newCopy.edition = editionAddress;
            newCopy.copyUid = event.params.copyUid;
            newCopy.owner = event.params.buyer.toHex();
            newCopy.previousOwner = book.publisherAddress.toHex();
            newCopy.lockedWith = new Bytes(0);
            newCopy.originalPrice = event.params.price;
            newCopy.purchasedOn = event.block.timestamp;
            newCopy.save();

            edition.salesRevenue = edition.salesRevenue.plus(event.params.price);
            edition.withdrawableRevenue = edition.withdrawableRevenue.plus(event.params.price);
            edition.pricedBookPrinted = edition.pricedBookPrinted.plus(BigInt.fromString("1"));
            edition.save();

            book.salesRevenue = book.salesRevenue.plus(event.params.price);
            book.withdrawableRevenue = book.withdrawableRevenue.plus(event.params.price);
            book.pricedBookPrinted = book.pricedBookPrinted.plus(BigInt.fromString("1"));
            book.save();
        }

        let buyRecord = new BuyRecord(
            event.params.copyUid.toString() + editionAddress + event.block.timestamp.toString()
        );
        buyRecord.buyer = event.params.buyer.toHex();
        buyRecord.purchaseDate = event.block.timestamp;
        buyRecord.copyId = event.params.copyUid;
        buyRecord.edition = editionAddress;
        buyRecord.save();
    }
}

// BookTransferred(uint256 copyUid, address indexed to);
// handleBookTransferred
export function handleBookTransferred(event: BookTransferred): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        let book = Book.load(edition.bookId.toString());
        let copy = Copy.load(event.params.copyUid.toString() + editionAddress);
        if (copy && book) {
            let reader = ReaderProfile.load(event.params.to.toHex());
            if (!reader) {
                reader = new ReaderProfile(event.params.to.toHex());
                reader.save();
            }

            copy.previousOwner = copy.owner;
            copy.owner = event.params.to.toHex();
            copy.purchasedOn = event.block.timestamp;
            copy.save();

            edition.royaltyRevenue = edition.royaltyRevenue.plus(edition.royalty);
            edition.withdrawableRevenue = edition.withdrawableRevenue.plus(edition.royalty);
            edition.transferVolume = edition.transferVolume.plus(BigInt.fromString("1"));
            edition.save();

            book.royaltyRevenue = book.royaltyRevenue.plus(edition.royalty);
            book.withdrawableRevenue = book.withdrawableRevenue.plus(edition.royalty);
            book.transferVolume = book.transferVolume.plus(BigInt.fromString("1"));
            book.save();

            let transferRecord = new TransferRecord(
                event.params.copyUid.toString() + editionAddress + event.block.timestamp.toString()
            );
            transferRecord.to = event.params.to.toHex();
            transferRecord.from = copy.previousOwner;
            transferRecord.copyId = event.params.copyUid;
            transferRecord.edition = editionAddress;
            transferRecord.transferDate = event.block.timestamp;
            transferRecord.save();
        }
    }
}

// PriceUpdated(uint256 newPrice);
// handlePriceUpdated
export function handlePriceUpdated(event: PriceUpdated): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        edition.price = event.params.newPrice;
        edition.save();
    }
}

// MarketSupplyIncreased(uint256 newPricedBookSupplyLimit);
// handleMarketSupplyIncreased
export function handleMarketSupplyIncreased(event: MarketSupplyIncreased): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        edition.pricedBookSupplyLimit = event.params.newPricedBookSupplyLimit;
        edition.save();
    }
}

// SupplyUnlimited()
// handleSupplyUnlimited
export function handleSupplyUnlimited(event: SupplyUnlimited): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        edition.supplyLimited = false;
        edition.save();
    }
}

// SupplyLimited()
// handleSupplyLimited
export function handleSupplyLimited(event: SupplyLimited): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        edition.supplyLimited = true;
        edition.save();
    }
}

// RoyaltyUpdated(uint256 newRoyalty);
// RoyaltyUpdated
export function handleRoyaltyUpdated(event: RoyaltyUpdated): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        edition.royalty = event.params.newRoyalty;
        edition.save();
    }
}

// BookRedeemed(
//     uint256 distributedCopyUid,
//     uint256 price,
//     address indexed receiver
// );
// handleBookRedeemed
export function handleBookRedeemed(event: BookRedeemed): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        let book = Book.load(edition.bookId.toString());
        let distributedCopy = DistributedCopy.load(
            event.params.distributedCopyUid.toString() + editionAddress
        );
        if (!distributedCopy && book) {
            let reader = ReaderProfile.load(event.params.receiver.toHex());
            if (!reader) {
                reader = new ReaderProfile(event.params.receiver.toHex());
                reader.save();
            }

            let newDistributedCopy = new DistributedCopy(
                event.params.distributedCopyUid.toString() + editionAddress
            );
            newDistributedCopy.copyUid = event.params.distributedCopyUid;
            newDistributedCopy.originalPrice = event.params.price;
            newDistributedCopy.receivedOn = event.block.timestamp;
            newDistributedCopy.edition = editionAddress;
            newDistributedCopy.receiver = event.params.receiver.toHex();
            if (event.params.price.gt(BigInt.fromString("0"))) {
                edition.distributionRevenue = edition.distributionRevenue.plus(event.params.price);
                edition.withdrawableRevenue = edition.withdrawableRevenue.plus(event.params.price);
                book.distributionRevenue = book.distributionRevenue.plus(event.params.price);
                book.withdrawableRevenue = book.withdrawableRevenue.plus(event.params.price);
            }
            edition.distributedBooksPrinted = edition.distributedBooksPrinted.plus(
                BigInt.fromString("1")
            );
            book.distributedBooksPrinted = book.distributedBooksPrinted.plus(
                BigInt.fromString("1")
            );
            newDistributedCopy.save();
            edition.save();
            book.save();
        }
    }
}

// handleContributorAdded
export function handleContributorAdded(event: ContributorAdded): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        log.info("{}", [event.params.contributorAddress.toHex()]);
        let contributor = ContributorProfile.load(event.params.contributorAddress.toHex());
        if (!contributor) {
            contributor = new ContributorProfile(event.params.contributorAddress.toHex());
            contributor.save();
        }

        let reader = ReaderProfile.load(event.params.contributorAddress.toHex());
        if (!reader) {
            reader = new ReaderProfile(event.params.contributorAddress.toHex());
            reader.save();
        }

        const contributionId =
            editionAddress + event.params.contributorAddress.toHex() + event.params.role;
        let newContribution = new Contribution(contributionId);
        newContribution.contributor = event.params.contributorAddress.toHex();
        newContribution.role = event.params.role;
        newContribution.share = event.params.share;
        newContribution.edition = editionAddress;
        newContribution.save();

        let book = Book.load(edition.bookId.toString());
        let distributedCopy = DistributedCopy.load(
            event.params.distributedCopyUid.toString() + editionAddress
        );
        if (!distributedCopy && book) {
            let newDistributedCopy = new DistributedCopy(
                event.params.distributedCopyUid.toString() + editionAddress
            );
            newDistributedCopy.copyUid = event.params.distributedCopyUid;
            newDistributedCopy.originalPrice = BigInt.fromString("0");
            newDistributedCopy.receivedOn = event.block.timestamp;
            newDistributedCopy.edition = editionAddress;
            newDistributedCopy.receiver = event.params.contributorAddress.toHex();
            edition.distributedBooksPrinted = edition.distributedBooksPrinted.plus(
                BigInt.fromString("1")
            );
            book.distributedBooksPrinted = book.distributedBooksPrinted.plus(
                BigInt.fromString("1")
            );
            newDistributedCopy.save();
            book.save();
            let tempArr = edition.contributions;
            tempArr.push(contributionId);
            edition.contributions = tempArr;
            edition.save();
        }
    }
}
// RevenueWithdrawn(uint256 withdrawableRevenue);
// RevenueWithdrawn
export function handleRevenueWithdrawn(event: RevenueWithdrawn): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        let book = Book.load(edition.bookId.toString());
        if (book) {
            book.withdrawableRevenue = book.withdrawableRevenue
                .minus(edition.withdrawableRevenue)
                .plus(event.params.withdrawableRevenue);
            edition.withdrawableRevenue = event.params.withdrawableRevenue;
            edition.save();
            book.save();
        }
    }
}

// BookLocked(uint256 copyUid, address indexed to);
// handleBookLocked
export function handleBookLocked(event: BookLocked): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        let copy = Copy.load(event.params.copyUid.toString() + editionAddress);
        if (copy) {
            copy.lockedWith = event.params.to;
            copy.save();
        }
    }
}

// BookUnlocked(uint256 copyUid);
// handleBookUnlocked
export function handleBookUnlocked(event: BookUnlocked): void {
    let context = dataSource.context();
    let editionAddress = context.getString("editionAddress");
    let edition = Edition.load(editionAddress);
    if (edition) {
        let copy = Copy.load(event.params.copyUid.toString() + editionAddress);
        if (copy) {
            copy.lockedWith = new Bytes(0);
            copy.save();
        }
    }
}
