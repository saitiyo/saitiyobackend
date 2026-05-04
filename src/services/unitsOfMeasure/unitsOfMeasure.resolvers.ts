import { GraphQLError } from "graphql";
import { UnitOfMeasure } from "../../db/models/units.schema";

const UnitOfMeasureResolvers = {
  Query: {
   
    getUnitsOfMeasure: async () => {
      const units = await UnitOfMeasure.find().sort({ name: 1 });
      return units.map((u) => u.toObject());
    },

  
    getUnitOfMeasure: async (_: any, { id }: { id: string }) => {
      const unit = await UnitOfMeasure.findById(id);
      if (!unit)
        throw new GraphQLError("Unit of measure not found", {
          extensions: { code: "NOT_FOUND" },
        });
      return unit.toObject();
    },
  },

  Mutation: {

    addUnitOfMeasure: async (
      _: any,
      {
        name,
        label,
        description,
      }: { name: string; label?: string; description?: string }
    ) => {
      // name is unique (enforced by schema index), give a clear error if duplicate
      const existing = await UnitOfMeasure.findOne({
        name: name.trim().toLowerCase(),
      });
      if (existing)
        throw new GraphQLError(
          `A unit named "${name.trim()}" already exists`,
          { extensions: { code: "BAD_USER_INPUT" } }
        );

      const unit = new UnitOfMeasure({
        name: name.trim().toLowerCase(),
        label: label?.trim() ?? null,
        description: description?.trim() ?? null,
      });

      await unit.save();
      return unit.toObject();
    },

 
    updateUnitOfMeasure: async (
      _: any,
      {
        id,
        name,
        label,
        description,
      }: { id: string; name?: string; label?: string; description?: string }
    ) => {
      const unit = await UnitOfMeasure.findById(id);
      if (!unit)
        throw new GraphQLError("Unit of measure not found", {
          extensions: { code: "NOT_FOUND" },
        });

      // If renaming, check the new name isn't already taken by another unit
      if (name && name.trim().toLowerCase() !== unit.name) {
        const duplicate = await UnitOfMeasure.findOne({
          name: name.trim().toLowerCase(),
          _id: { $ne: id },
        });
        if (duplicate)
          throw new GraphQLError(
            `A unit named "${name.trim()}" already exists`,
            { extensions: { code: "BAD_USER_INPUT" } }
          );
        unit.name = name.trim().toLowerCase();
      }

      if (label       !== undefined) unit.label       = label?.trim()       ?? null;
      if (description !== undefined) unit.description = description?.trim() ?? null;

      await unit.save();
      return unit.toObject();
    },

  
    deleteUnitOfMeasure: async (_: any, { id }: { id: string }) => {
      const unit = await UnitOfMeasure.findById(id);
      if (!unit)
        throw new GraphQLError("Unit of measure not found", {
          extensions: { code: "NOT_FOUND" },
        });

      await UnitOfMeasure.findByIdAndDelete(id);
      return true;
    },
  },
};

export default UnitOfMeasureResolvers;