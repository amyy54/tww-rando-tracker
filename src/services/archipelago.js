import { Client } from "archipelago.js";

class ArchipelagoClient {
    constructor(server, slotName, password) {
        this.server = server;
        this.slotName = slotName;
        this.password = password
        this.client = new Client();
        this.queuedItems = [];
        this.queueTimer = undefined;

        this.client.messages.on("message", (text) => { console.log(`[archipelago-msg] ${text}`); });
        this.client.messages.on("itemSent", this.handleSentItems.bind(this));
    }

    async connect() {
        let uriName = this.server
        if (!uriName.includes("ws://") && !uriName.includes("wss://")) {
            uriName = `wss://${uriName}`;
        }
        try {
            await this.client.login(uriName, this.slotName, "The Wind Waker", {tags: ["Tracker"], password: this.password});
        } catch (error) {
            console.error(error);
        }
        this.handleItems(this.client.items.received);
        return this.client.authenticated;
    }

    disconnect() {
        this.client.socket.disconnect();
    }

    /*  
    Create a queue of items for processing after it's been a 
    while since items have been received. This *must* be done
    to allow people to release/collect, and in case checks get
    collected twice in quick succession (see: Tingle). Half a
    second is arbitrary but the delay is insignificant through
    real-world use, even if it delays all updates by half a
    second in case anything more is coming. Release signals can
    be used, but then checks like Tingle wouldn't work.
    Best compromise I could think of.
    */
    handleSentItems(_, item) {
        let clientName = this.client.name.trim();
        if (item.receiver.name.trim() == clientName || item.sender.name.trim() == clientName) {
            this.queuedItems.push(item);
            if (this.queueTimer != undefined) {
                clearTimeout(this.queueTimer);
            }
            this.queueTimer = setTimeout(() => {
                this.handleItems(this.queuedItems);
                this.queuedItems = [];
            }, 500);
        } // If it has nothing to do with us, just throw it out
    }

    handleItems(items) {
        let locationList = [];
        let itemList = [];
        for (const item of items) {
            // Any item that isn't sent by us or received by us is ignored entirely
            // If received by us, then it's our item, and should be tracked (if necessary)
            // If it's sent by us, we got a check somewhere and it should be marked off
            // Obviously, if both the receiver and sender are us, do double duty
            if (item.receiver.name.trim() == this.client.name.trim()) { // Received an item
                let itemName = item.name;
                console.log(`[archipelago] Received ${itemName}`);

                // Additional logic to play nice with the tracker
                // Archipelago (correctly) specifies Shard number which the tracker doesn't care about
                if (itemName.includes("Triforce Shard")) {
                    itemName = "Triforce Shard";
                }

                // Same issue with Tingle Statues
                if (itemName.includes("Tingle Statue")) {
                    itemName = "Tingle Statue";
                }

                itemList.push(itemName);
            }
            if (item.sender.name.trim() == this.client.name.trim()) { // Sent an item
                let locationName = item.locationName;
                let allowPush = true;
                console.log(`[archipelago] Checked ${locationName}`);

                // Additional logic to play nice with the tracker
                // "Server" isn't a valid location for the tracker, and should thus be ignored
                if (locationName == "Server") {
                    allowPush = false;
                }

                if (allowPush) {
                    locationList.push(locationName);
                }
            }
        }
        let itemEvent = new CustomEvent("archipelago-item", {
            detail: {
                locationList: locationList,
                itemList: itemList
            }
        });
        dispatchEvent(itemEvent);

    }
}

export default ArchipelagoClient;