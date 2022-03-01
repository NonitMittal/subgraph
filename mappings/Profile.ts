import {ContributorProfileUpdated, ReaderProfileUpdated} from "../generated/Profile/Profile";
import {ContributorProfile, ReaderProfile} from "../generated/schema";
import {JSONValue, json, ipfs} from "@graphprotocol/graph-ts";

export function handleContributorProfileUpdated(event: ContributorProfileUpdated): void {
    let contributor = ContributorProfile.load(event.params.contributorAddress.toString());
    if (!contributor) {
        contributor = new ContributorProfile(event.params.contributorAddress.toString());
    }
    let ipfsData = ipfs.cat(event.params.profileMetadataUri.toString());
    if (ipfsData) {
        let jsonData = json.fromBytes(ipfsData);
        let object = jsonData.toObject();
        if (object) {
            contributor.username = object.get("username").toString();
            contributor.name = object.get("name").toString();
            contributor.aboutMe = object.get("aboutMe").toString();
            contributor.handles = object
                .get("handles")
                .toArray()
                .map<string>((handle: JSONValue): string => {
                    return handle.toString();
                });
        }
    }
    contributor.save();
}

export function handleReaderProfileUpdated(event: ReaderProfileUpdated): void {
    let reader = ReaderProfile.load(event.params.readerAddress.toString());
    if (!reader) {
        reader = new ReaderProfile(event.params.readerAddress.toString());
    }
    let ipfsData = ipfs.cat(event.params.profileMetadataUri.toString());
    if (ipfsData) {
        let jsonData = json.fromBytes(ipfsData);
        let object = jsonData.toObject();
        if (object) {
            reader.username = object.get("username").toString();
            reader.name = object.get("name").toString();
            reader.aboutMe = object.get("aboutMe").toString();
            reader.handles = object
                .get("handles")
                .toArray()
                .map<string>((handle: JSONValue): string => {
                    return handle.toString();
                });
        }
    }
    reader.save();
}
