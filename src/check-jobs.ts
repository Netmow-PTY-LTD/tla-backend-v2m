import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkJobs = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('Connected to DB');

        const ScheduledJob = mongoose.model('ScheduledJob', new mongoose.Schema({
            name: String,
            task: String,
            active: Boolean,
            runner: String,
            cron: String,
            lastRunAt: Date
        }));

        const jobs = await ScheduledJob.find();
        console.log('--- Scheduled Jobs ---');
        jobs.forEach(j => {
            console.log(`Name: ${j.name}, Task: ${j.task}, Runner: ${j.runner}, Active: ${j.active}, LastRun: ${j.lastRunAt}, Cron: ${j.cron}`);
        });
        console.log('----------------------');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkJobs();
