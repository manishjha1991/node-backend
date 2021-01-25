export const configurationFile = {
  development: {
    mongoUrl:
      "mongodb://manish:manishjha.123@cluster0-shard-00-00-gvk1v.mongodb.net:27017,cluster0-shard-00-01-gvk1v.mongodb.net:27017,cluster0-shard-00-02-gvk1v.mongodb.net:27017/basisXelpmocDev?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin",

    kiteConnect: {
      apiKey: "b3gwlue1woo8oomf",
      apiSecret: "cuglqt640t577lyv3m64pnj9igtat3q6"
    }
  },

  loggerConfig: {
    level: "debug",
    rotation: "d",
    size: 5,
    json: true,
    timestamp: true
  }
};
