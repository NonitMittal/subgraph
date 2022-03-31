import {DataSourceContext, json, JSONValue, ipfs} from "@graphprotocol/graph-ts";
import {
    AddedBookToSeries,
    NewBookLaunched,
    NewEditionLaunched,
    NewSeriesCreated
} from "../generated/Publisher/Publisher";
import {Book, Series, Edition, SeriesMetadata, EditionMetadata} from "../generated/schema";
import {Edition as EditionContract} from "../generated/templates";

export function handleNewBookLaunched(event: NewBookLaunched): void {
    let book = Book.load(event.params.bookId.toString());
    if (!book) {
        let context = new DataSourceContext();
        context.setString("editionAddress", event.params.editionAddress.toHex());
        EditionContract.createWithContext(event.params.editionAddress, context);

        let newBook = new Book(event.params.bookId.toString());
        newBook.publishedOn = event.block.timestamp;
        newBook.publisherAddress = event.params.publisher;

        let newEdition = new Edition(event.params.editionAddress.toHex());
        newEdition.bookId = event.params.bookId;
        newEdition.publisherAddress = event.params.publisher;
        newEdition.editionMetadataUri = event.params.metadataUri.toString();
        newEdition.price = event.params.price;
        newEdition.royalty = event.params.royalty;
        newEdition.supplyLimited = event.params.supplyLimited;
        newEdition.pricedBookSupplyLimit = event.params.pricedBookSupplyLimit;
        newEdition.contributions = [];
        newEdition.revisedOn = event.block.timestamp;

        // loading the BookMetaData from IPFS node (nft.storage)
        let ipfsData = ipfs.cat(event.params.metadataUri.toString());
        if (ipfsData) {
            let jsonData = json.fromBytes(ipfsData);
            let object = jsonData.toObject();

            if (object) {
                let editionMetadata = new EditionMetadata(event.params.editionAddress.toHex());
                editionMetadata.title = object.get("title")!.toString();
                editionMetadata.subtitle = object.get("subtitle")!.toString();
                editionMetadata.language = object.get("language")!.toString();
                editionMetadata.description = object.get("description")!.toString();
                editionMetadata.coverPage = object.get("coverPage")!.toString();
                editionMetadata.copyrights = object.get("copyrights")!.toString();
                editionMetadata.currency = object.get("currency")!.toString();
                editionMetadata.keywords = object
                    .get("keywords")!
                    .toArray()
                    .map<string>((keyword: JSONValue): string => {
                        return keyword.toString();
                    });
                editionMetadata.genres = object
                    .get("genres")!
                    .toArray()
                    .map<string>((genre: JSONValue): string => {
                        return genre.toString();
                    });
                editionMetadata.save();
                newEdition.editionMetadata = event.params.editionAddress.toHex();
                let tempArr = newBook.editions;
                tempArr.push(event.params.editionAddress.toHex());
                newBook.editions = tempArr;
            }
        }
        newEdition.save();
        newBook.save();
    }
}

export function handleNewEditionLaunched(event: NewEditionLaunched): void {
    let book = Book.load(event.params.bookId.toString());
    if (book) {
        let context = new DataSourceContext();
        context.setString("editionAddress", event.params.editionAddress.toHex());
        EditionContract.createWithContext(event.params.editionAddress, context);

        let newEdition = new Edition(event.params.editionAddress.toHex());
        newEdition.editionMetadataUri = event.params.metadataUri.toString();
        newEdition.price = event.params.price;
        newEdition.royalty = event.params.royalty;
        newEdition.supplyLimited = event.params.supplyLimited;
        newEdition.pricedBookSupplyLimit = event.params.pricedBookSupplyLimit;
        newEdition.contributions = [];
        newEdition.revisedOn = event.block.timestamp;

        // loading the BookMetaData from IPFS node (nft.storage)
        let ipfsData = ipfs.cat(event.params.metadataUri.toString());
        if (ipfsData) {
            let jsonData = json.fromBytes(ipfsData);
            let object = jsonData.toObject();

            if (object) {
                let editionMetadata = new EditionMetadata(event.params.editionAddress.toHex());
                editionMetadata.title = object.get("title")!.toString();
                editionMetadata.subtitle = object.get("subtitle")!.toString();
                editionMetadata.language = object.get("language")!.toString();
                editionMetadata.description = object.get("description")!.toString();
                editionMetadata.coverPage = object.get("coverPage")!.toString();
                editionMetadata.copyrights = object.get("copyrights")!.toString();
                editionMetadata.currency = object.get("currency")!.toString();
                editionMetadata.keywords = object
                    .get("keywords")!
                    .toArray()
                    .map<string>((keyword: JSONValue): string => {
                        return keyword.toString();
                    });
                editionMetadata.genres = object
                    .get("genres")!
                    .toArray()
                    .map<string>((genre: JSONValue): string => {
                        return genre.toString();
                    });
                editionMetadata.save();
                newEdition.editionMetadata = event.params.editionAddress.toHex();
                let tempArr = book.editions;
                tempArr.push(event.params.editionAddress.toHex());
                book.editions = tempArr;
            }
        }
        newEdition.save();
        book.save();
    }
}

export function handleNewSeriesCreated(event: NewSeriesCreated): void {
    let series = Series.load(event.params.seriesId.toString());
    if (!series) {
        let newSeries = new Series(event.params.seriesId.toString());
        newSeries.seriesMetadataUri = event.params.seriesMetadatUri.toString();
        newSeries.books = [];

        let ipfsData = ipfs.cat(event.params.seriesMetadatUri.toString());
        if (ipfsData) {
            let jsonData = json.fromBytes(ipfsData);
            let object = jsonData.toObject();

            if (object) {
                let seriesMetadata = new SeriesMetadata(event.params.seriesId.toString());
                seriesMetadata.title = object.get("title")!.toString();
                seriesMetadata.description = object.get("description")!.toString();
                seriesMetadata.keywords = object
                    .get("keywords")!
                    .toArray()
                    .map<string>((keyword: JSONValue): string => {
                        return keyword.toString();
                    });
                seriesMetadata.save();
                newSeries.seriesMetadata = event.params.seriesId.toString();
            }
        }
        newSeries.save();
    }
}

export function handleAddedBookToSeries(event: AddedBookToSeries): void {
    let series = Series.load(event.params.seriesId.toString());
    if (series) {
        let tempArr = series.books;
        tempArr.push(event.params.bookId.toString());
        series.books = tempArr;
        series.save();
    }
}
