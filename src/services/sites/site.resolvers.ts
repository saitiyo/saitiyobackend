import { Site } from "../../db/models/site.schema";
import { differenceInDays } from 'date-fns';

const SiteResolvers = {
  Query: {
    getMySites: async (_:any,{userId}:{userId:string}) => {
        
      const mySites = await Site.find({
        owner:userId
      });
      
      return mySites.map(Site => {
        // Logic for "Days Left" using date-fns
        const now = new Date();
        const end = new Date(Site.endDate);
        const daysLeft = Math.max(0, differenceInDays(end, now));

        // Logic for Progress Bar (completed vs total)
        const progress = Site.totalTasks > 0 
          ? (Site.completedTasks / Site.totalTasks) * 100 
          : 0;

        return {
          ...Site.toObject(),
          id: Site._id,
          daysLeft: Site.status === 'CLOSED' ? 0 : daysLeft,
          progress: Site.status === 'CLOSED' ? 100 : progress
        };
      });
    }
  },

  Mutation: {
    createSite: async (_:any, { name, endDate, logoUrl,userId }:{name:string, endDate:string, logoUrl:string,userId:string}) => {
      const newSite = new Site({
        owner:userId,
        name,
        endDate,
        logoUrl,
        status: 'IN_PROGRESS'
      });
      return await newSite.save();
    }
  }
};


export default SiteResolvers;