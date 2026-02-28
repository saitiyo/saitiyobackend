import { Project } from "../../db/models/project.schema";
import { differenceInDays } from 'date-fns';

const ProjectResolvers = {
  Query: {
    projects: async () => {
        
      const projects = await Project.find();
      
      return projects.map(project => {
        // Logic for "Days Left" using date-fns
        const now = new Date();
        const end = new Date(project.endDate);
        const daysLeft = Math.max(0, differenceInDays(end, now));

        // Logic for Progress Bar (completed vs total)
        const progress = project.totalTasks > 0 
          ? (project.completedTasks / project.totalTasks) * 100 
          : 0;

        return {
          ...project.toObject(),
          id: project._id,
          daysLeft: project.status === 'CLOSED' ? 0 : daysLeft,
          progress: project.status === 'CLOSED' ? 100 : progress
        };
      });
    }
  },

  Mutation: {
    createProject: async (_:any, { name, endDate, logoUrl }:{name:string, endDate:string, logoUrl:string}) => {
      const newProject = new Project({
        name,
        endDate,
        logoUrl,
        status: 'IN_PROGRESS'
      });
      return await newProject.save();
    }
  }
};


export default ProjectResolvers;