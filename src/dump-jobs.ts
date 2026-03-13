import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkJobs = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        const ScheduledJob = mongoose.model('ScheduledJob', new mongoose.Schema({}, { strict: false }));
        const jobs = await ScheduledJob.find();
        console.log(JSON.stringify(jobs, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkJobs();
