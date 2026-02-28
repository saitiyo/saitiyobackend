import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AdminSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }

}, { timestamps: true });


const UserSchema = new Schema({
    firstName: { type: String, required: false},
    lastName: { type: String, required: false},
    email: { type: String, required: false},
    mobileNumber: { type: String, required: true, unique: true },
    countryId: { type: String, required: false },

}, { timestamps: true });


const CountrySchema = new Schema({
    name: { type: String, required: true},
    flagUri: { type: String, required: true},
    callingCode: { type: String, required: true },
    currencyName: { type: String, required: true },
    currencyCode: { type: String, required: true }
});


const UserLocationSchema = new Schema({
    lat: { type: Number, required: true},
    long: { type: Number, required: true},
    ip: { type: String, required: true },
    userId: { type: String, required: true, unique: true }
   }, { timestamps: true });

const DeviceSchema = new Schema({
    deviceId: { type: String, required: true},
    fingurePrint: { type: String, required: true},
    manufacturer: { type: String, required: true },
    brand: { type: String, required: true },
    isEmulator: { type: Boolean, required: true },
    installOdavoltVersion:{type:String,required:true},
    updatedOdavoltVersion:{type:String,required:true},
    isIOS:{type:Boolean,required:true},
    isAndroid:{type:Boolean,required:true},
    carrier:{type:String,required:true},
    isTablet:{type:Boolean,required:true},
    ip:{type:String,required:true},
    timeZone:{type:String,default:"Africa/Kampala"},
    userId:{type:String,required:true}
}, { timestamps: true });


export const Admin = model('Admin', AdminSchema);
export const User = model('User', UserSchema);
export const Country = model('Country', CountrySchema);
export const UserLocation = model('UserLocation', UserLocationSchema);
export const Device = model('Device', DeviceSchema);    