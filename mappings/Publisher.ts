import { BigInt, DataSourceContext, Address } from "@graphprotocol/graph-ts";
import { BookPublished } from "../generated/Publisher/Publisher";
import { Book, BookMetaData } from "../generated/schema";
import { Book as BookContract } from "../generated/templates";

export function handleBookPublished(event: BookPublished): void {
    let book = Book.load(event.params.bookId.toString());
    if (!book) {
        let context = new DataSourceContext();
        context.setString("bookId", event.params.bookId.toString());
        BookContract.createWithContext(event.params.bookAddress, context);
        let newBook = new Book(event.params.bookId.toString());
        newBook.metadataUri = event.params.metadataUri.toString();
        newBook.coverPageUri = event.params.coverPageUri.toString();
        newBook.publisher = event.params.publisher;
        newBook.price = event.params.price;
        newBook.royalty = event.params.royalty;
        newBook.edition = event.params.edition
            ? event.params.edition.toString()
            : null;
        newBook.prequel = event.params.prequel
            ? event.params.prequel.toString()
            : null;
        newBook.supplyLimited = event.params.supplyLimited;
        newBook.pricedBookSupplyLimit = event.params.pricedBookSupplyLimit;
        newBook.publishedOn = event.block.timestamp;
        newBook.save();
    }
}

// remining IPFS
// 0x82Ffc6d4c895B629f2fB3b27d15aC9620AA02561
