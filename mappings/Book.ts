import { Bytes, dataSource, BigInt } from "@graphprotocol/graph-ts";
import {
  BookBought,
  BookTransferred,
  PriceUpdated,
  SellingPriceUpdated,
  MarketSupplyIncreased,
  SupplyLimited,
  SupplyUnlimited,
  RoyaltyUpdated,
  BookRedeemed,
  CoverPageUpdated,
  ContributorAdded,
  ContributorRemoved,
  ContributorUpdated,
  RevenueWithdrawn,
  BookLocked,
  BookUnlocked,
} from "../generated/templates/Book/Book";
import { Book, Copy, Contributor, DistributedCopy } from "../generated/schema";

// BookBought(uint256 copyUid, address indexed buyer, uint256 price);
// handleBookBought
// TODO
export function handleBookBought(event: BookBought): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    let copy = Copy.load(event.params.copyUid.toString());
    if (!copy) {
      let newCopy = new Copy(event.params.copyUid.toString());
      newCopy.originalPrice = event.params.price;
      newCopy.coverPageUri = book.coverPageUri;
      newCopy.previousOwner = book.publisher;
      newCopy.lockedWith = new Bytes(0);
      newCopy.sellingPrice = event.params.price;
      newCopy.purchasedOn = event.block.timestamp;
      newCopy.book = bookId;
      //newCopy.owner = owner;
      book.pricedBooksPrinted = book.pricedBooksPrinted.plus(new BigInt(1));
      book.totalRevenue = book.totalRevenue.plus(
        new BigInt(event.params.price)
      );
      book.withdrawableRevenue = book.withdrawableRevenue.plus(
        new BigInt(event.params.price)
      );
      book.save();
      newCopy.save();
    }
  }
}

// BookTransferred(uint256 copyUid, address indexed to);
// handleBookTransferred
// TODO
export function handleBookTransferred(event: BookTransferred): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    let copy = Copy.load(event.params.copyUid.toString());
    if (copy) {
      // copy.owner = ;
      // copy.previousOwner = copy.owner;
      copy.purchasedOn = event.block.timestamp;
      book.totalRevenue = book.totalRevenue.plus(new BigInt(book.royalty));
      book.withdrawableRevenue = book.withdrawableRevenue.plus(
        new BigInt(book.royalty)
      );
      book.save();
      copy.save();
    }
  }
}

// PriceUpdated(uint256 newPrice);
// handlePriceUpdated
export function handlePriceUpdated(event: PriceUpdated): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    book.price = event.params.newPrice;
    book.save();
  }
}

// SellingPriceUpdated(uint256 copyUid, uint256 newSellingPrice);
// handleSellingPriceUpdated
export function handleSellingPriceUpdated(event: SellingPriceUpdated): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    let copy = Copy.load(event.params.copyUid.toString());
    if (copy) {
      copy.sellingPrice = event.params.newSellingPrice;
      copy.save();
    }
  }
}

// MarketSupplyIncreased(uint256 newPricedBookSupplyLimit);
// handleMarketSupplyIncreased
export function handleMarketSupplyIncreased(
  event: MarketSupplyIncreased
): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    book.pricedBookSupplyLimit = event.params.newPricedBookSupplyLimit;
    book.save();
  }
}

// SupplyUnlimited()
// handleSupplyUnlimited
export function handleSupplyUnlimited(event: SupplyUnlimited): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    book.supplyLimited = false;
    book.save();
  }
}

// SupplyLimited()
// handleSupplyLimited
export function handleSupplyLimited(event: SupplyLimited): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    book.supplyLimited = true;
    book.save();
  }
}

// RoyaltyUpdated(uint256 newRoyalty);
// RoyaltyUpdated
export function handleRoyaltyUpdated(event: RoyaltyUpdated): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    book.royalty = event.params.newRoyalty;
    book.save();
  }
}

// BookRedeemed(
//     uint256 distributedCopyUid,
//     uint256 price,
//     address indexed receiver
// );
// handleBookRedeemed
// TODO
export function handleBookRedeemed(event: BookRedeemed): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    let distributedCopy = DistributedCopy.load(
      event.params.distributedCopyUid.toString()
    );
    if (!distributedCopy) {
      let newDistributedCopy = new DistributedCopy(
        event.params.distributedCopyUid.toString()
      );
      newDistributedCopy.originalPrice = event.params.price;
      newDistributedCopy.coverPageUri = book.coverPageUri;
      newDistributedCopy.receivedOn = event.block.timestamp;
      newDistributedCopy.book = bookId;
      //   newDistributedCopy.receiver = ...
      if (event.params.price.gt(new BigInt(0))) {
        book.distributedBooksPrinted = book.distributedBooksPrinted.plus(
          new BigInt(1)
        );
        book.totalRevenue = book.totalRevenue.plus(
          new BigInt(event.params.price)
        );
        book.withdrawableRevenue = book.withdrawableRevenue.plus(
          new BigInt(event.params.price)
        );
        book.save();
        newDistributedCopy.save();
      }
    }
  }
}

// CoverPageUpdated(bytes32 newCoverPageUri);
// handleCoverPageUpdated
export function handleCoverPageUpdated(event: CoverPageUpdated): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    book.coverPageUri = event.params.newCoverPageUri.toString();
    book.save();
  }
}

// ContributorAdded(address indexed contributorAddress, uint96 share);
// handleContributorAdded
// TODO
export function handleContributorAdded(event: ContributorAdded): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
  }
}

// ContributorRemoved(address indexed contributorAddress);
// handleContributorRemoved
// TODO
export function handleContributorRemoved(event: ContributorRemoved): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
  }
}

// ContributorUpdated(address indexed contributorAddress, uint96 share);
// handleContributorUpdated
// TODO
export function handleContributorUpdated(event: ContributorUpdated): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
  }
}

// RevenueWithdrawn(uint256 withdrawableRevenue);
// RevenueWithdrawn
export function handleRevenueWithdrawn(event: RevenueWithdrawn): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
      book.withdrawableRevenue = event.params.withdrawableRevenue;
      book.save();
  }
}

// BookLocked(uint256 copyUid, address indexed to);
// handleBookLocked
export function handleBookLocked(event: BookLocked): void {
  let context = dataSource.context();
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    let copy = Copy.load(event.params.copyUid.toString());
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
  let bookId = context.getString("bookId");
  let book = Book.load(bookId);
  if (book) {
    let copy = Copy.load(event.params.copyUid.toString());
    if (copy) {
      copy.lockedWith = new Bytes(0);
      copy.save();
    }
  }
}
