const {model}=require("mongoose");
const {WatchListSchema}=require("../Schemas/WatchListSchema")

const WatchListsModel = new model("watchlist",WatchListSchema);

module.exports={WatchListsModel};