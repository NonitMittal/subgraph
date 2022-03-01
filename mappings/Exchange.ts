import {OfferMade, OfferCancelled, OfferAccepted} from "../generated/Exchange/Exchange";
import {Offer} from "../generated/schema";
import {store} from "@graphprotocol/graph-ts";

export function handleOfferMade(event: OfferMade): void {
    const offerId =
        event.params.copyUid.toString() +
        event.params.bookAddress.toString() +
        event.params.offerer.toString();
    let offer = Offer.load(offerId);
    if (!offer) {
        offer = new Offer(offerId);
    }
    offer.copy = event.params.copyUid.toString() + event.params.bookAddress.toString();
    offer.offerPrice = event.params.offerPrice;
    offer.offerer = event.params.offerer;
    offer.save();
}

export function handleOfferCancelled(event: OfferCancelled): void {
    const offerId =
        event.params.copyUid.toString() +
        event.params.bookAddress.toString() +
        event.params.offerer.toString();
    let offer = Offer.load(offerId);
    if (offer) {
        store.remove("Offer", offerId);
    }
}

export function handleOfferAccepted(event: OfferAccepted): void {
    const offerId =
        event.params.copyUid.toString() +
        event.params.bookAddress.toString() +
        event.params.offerer.toString();
    let offer = Offer.load(offerId);
    if (offer) {
        store.remove("Offer", offerId);
    }
}
