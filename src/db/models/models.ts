import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AdminSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }

}, { timestamps: true });


const UserSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }

}, { timestamps: true });

export const Admin = model('Admin', AdminSchema);
export const User = model('User', UserSchema);