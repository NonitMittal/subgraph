import { DataSourceContext, json, JSONValue, ipfs } from "@graphprotocol/graph-ts";
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
        newBook.edition = event.params.edition ? event.params.edition.toString() : null;
        newBook.prequel = event.params.prequel ? event.params.prequel.toString() : null;
        newBook.supplyLimited = event.params.supplyLimited;
        newBook.pricedBookSupplyLimit = event.params.pricedBookSupplyLimit;
        newBook.publishedOn = event.block.timestamp;

        // loading the BookMetaData from IPFS node (nft.storage)
        let ipfsData = ipfs.cat(event.params.metadataUri.toString());
        if (ipfsData) {
            let jsonData = json.fromBytes(ipfsData);
            let object = jsonData.toObject();

            if (object) {
                let metaData = new BookMetaData(event.params.bookId.toHexString());
                metaData.title = object.get("title")!.toString();
                metaData.subTitle = object.get("subTitle")!.toString();
                metaData.language = object.get("language")!.toString();
                metaData.description = object.get("description")!.toString();
                metaData.copyrights = object.get("copyrights")!.toString();
                metaData.keywords = object
                    .get("keywords")!
                    .toArray()
                    .map<string>((keyword: JSONValue): string => {
                        return keyword.toString();
                    });
                metaData.genres = object
                    .get("genres")!
                    .toArray()
                    .map<string>((genre: JSONValue): string => {
                        return genre.toString();
                    });
                metaData.currency = object.get("currency")!.toString();

                newBook.bookMetaData = event.params.bookId.toHexString();
                metaData.save();
            }
        }
        newBook.save();
    }
}

// type BookMetaData @entity {
//     id: ID!
//     title: String!
//     subTitle: String!
//     language: String!
//     BigIntPublished: BigInt!
//     description: String!
//     copyrights: String!
//     keywords: [String!]!
//     fiction: Boolean!
//     genre: [String!]!
//     currency: String!
// }
// remining IPFS
// 0x82Ffc6d4c895B629f2fB3b27d15aC9620AA02561
