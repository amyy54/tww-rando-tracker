import { Client, Item } from "archipelago.js";

class ArchipelagoClient {
    constructor(server, slotName, password) {
        this.server = server;
        this.slotName = slotName;
        this.password = password
        this.client = new Client();

        this.client.messages.on("message", (text) => { console.log(`[archipelago-msg] ${text}`); });
        this.client.items.on("itemsReceived", this.handleItems.bind(this));
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
        return this.client.authenticated;
    }

    disconnect() {
        this.client.socket.disconnect();
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