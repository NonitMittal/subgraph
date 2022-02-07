import { dataSource } from "@graphprotocol/graph-ts";
import { Book, BookMetaData } from "../generated/schema";

let context = dataSource.context();
let bookId = context.getString("bookId");
let newBook = Book.load(bookId);

// BookBought(uint256,indexed address, uint256)
// handleBookBought

// BookTransferred(uint256,indexed address)
// handleBookTransferred

// PriceUpdated(uint256)
// handlePriceUpdated

// SellingPriceUpdated(uint256,uint256)
// handleSellingPriceUpdated

// MarketSupplyIncreased(uint256)
// handleMarketSupplyIncreased

// SupplyUnlimited()
// handleSupplyUnlimited

// SupplyLimited()
// handleSupplyLimited

// RoyaltyUpdated(uint256)
// RoyaltyUpdated

// BookRedeemed(uint256,uint256,indexed address)
// handleBookRedeemed

// CoverPageUpdated(bytes32)
// handleCoverPageUpdated

// ContributorAdded(indexed address, uint96)
// handleContributorAdded

// ContributorRemoved(indexed address)
// handleContributorRemoved

// ContributorUpdated(indexed address, uint96)
// handleContributorUpdated

// RevenueWithdrawn(uint256)
// evenueWithdrawn

// BookLocked(uint256,indexed address)
// handleBookLocked

// BookUnlocked(uint256)
// handleBookUnlocked