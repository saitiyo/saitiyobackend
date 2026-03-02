import { Country } from '../../../db/models/models';

const resolvers = {
  Query: {
    countries: async () => {
      return await Country.find();
    },
    country: async (_:any, { id }:{id:string}) => {
      return await Country.findById(id);
    },
  },
  Mutation: {
    createCountry: async (_:any, { name, flagUri, callingCode, currencyName, currencyCode }:{name:string,flagUri:string,callingCode:string,currencyName:string,currencyCode:string}) => {
      const newCountry = new Country({
        name,
        flagUri,
        callingCode,
        currencyName,
        currencyCode,
      });
      return await newCountry.save();
    },
    deleteCountry: async (_:any, { id }:{id:string}) => {
      const result = await Country.deleteOne({ _id: id });
      return result.deletedCount > 0;
    },
  },
};

export default resolvers;
