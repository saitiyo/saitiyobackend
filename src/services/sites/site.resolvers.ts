import { GraphQLError } from "graphql";
import { Site } from "../../db/models/site.schema";
import { differenceInDays } from 'date-fns';
import { TeamMember } from "../../db/models/team.schema";
import mongoose from "mongoose";

type CreateSiteArgs = {
  name: string;
  endDate: string;
  logoUrl?: string;
  userId: string;
};

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

    createSite: async (
  _: unknown,
  { name, endDate, logoUrl, userId }: CreateSiteArgs
) => {
  // Validate input before opening a transaction
  const trimmedName = name?.trim();
  const trimmedUserId = userId?.trim();

  if (!trimmedName) {
    throw new GraphQLError('Site name is required', {
      extensions: {
        code: 'BAD_USER_INPUT',
      },
    });
  }

  if (!trimmedUserId) {
    throw new GraphQLError('User ID is required', {
      extensions: {
        code: 'BAD_USER_INPUT',
      },
    });
  }

  const parsedEndDate = new Date(endDate);

  if (Number.isNaN(parsedEndDate.getTime())) {
    throw new GraphQLError('Invalid end date', {
      extensions: {
        code: 'BAD_USER_INPUT',
      },
    });
  }

  const session = await mongoose.startSession();

  try {

    let createdSite: any;

    await session.withTransaction(async () => {
  const site = new Site({
    owner: trimmedUserId,
    name: trimmedName,
    endDate: parsedEndDate,
    logoUrl: logoUrl?.trim() || undefined,
    status: 'IN_PROGRESS',
  });

  await site.save({ session });

  const teamMember = await TeamMember.create(
    [
      {
        siteId: site._id,
        userId: trimmedUserId,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    ],
    { session }
  );

  createdSite = site;

  console.log('Site created successfully:', {
    siteId: site._id,
    owner: teamMember,
  });

});

    return createdSite;
  } catch (error: unknown) {
    console.error('Error creating site:', {
      userId: trimmedUserId,
      error,
    });

    // Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      throw new GraphQLError('Invalid site data', {
        extensions: {
          code: 'BAD_USER_INPUT',
          details: Object.values(error.errors).map(
            (validationError) => validationError.message
          ),
        },
      });
    }

    // Duplicate key
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new GraphQLError('A site or team membership already exists', {
        extensions: {
          code: 'CONFLICT',
        },
      });
    }

    throw new GraphQLError('Failed to create site', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  } finally {
    await session.endSession();
  }
},
    
  }
};


export default SiteResolvers;