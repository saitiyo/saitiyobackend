import { GraphQLError } from "graphql";
import { Site } from "../../db/models/site.schema";
import { differenceInDays } from 'date-fns';
import { TeamMember } from "../../db/models/team.schema";

const SiteResolvers = {
  Query: {
    getSites: async () => {
      try {
        const sites = await Site.find();
        return sites.map(Site => {
          // Logic for "Days Left" using date-fns
          const now = new Date();
          const end = new Date(Site.endDate);
          const daysLeft = Math.max(0, differenceInDays(end, now));
          return {
            ...Site.toObject(),
            daysLeft
          };
        }); 
      } catch (error) {
        throw new GraphQLError('Failed to fetch sites', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',  
          }
        });   

      }
     },
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
     try {

       const newSite = new Site({
        owner:userId,
        name,
        endDate,
        logoUrl,
        status: 'IN_PROGRESS'
      });
      


      const new_site = await newSite.save();
      //add user with userId as site first team member
       
     await TeamMember.create({
        siteId: new_site._id,
        userId: userId,
        role: 'OWNER',
        status: 'ACTIVE'     
      });


      return new_site

      
     } catch (error) {
      console.log('Error creating site:', error);
      throw new GraphQLError('Failed to create site', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',  
        }   
      });
     }
    }
  }
};


export default SiteResolvers;