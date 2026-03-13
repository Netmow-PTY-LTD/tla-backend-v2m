import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkJobs = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        const ScheduledJob = mongoose.model('ScheduledJob', new mongoose.Schema({}, { strict: false }));
        
        const jobs = await ScheduledJob.find({ task: 'send-email' });
        let output = '--- send-email jobs ---\n';
        jobs.forEach((j: any) => {
            output += `ID: ${j._id}, Name: ${j.name}, Runner: ${j.runner}, Active: ${j.active}, LastRun: ${j.lastRunAt}\n`;
        });
        
        const allJobs = await ScheduledJob.find();
        output += '\n--- All Jobs ---\n';
        allJobs.forEach((j: any) => {
            output += `ID: ${j._id}, Task: ${j.task}, Runner: ${j.runner}, Active: ${j.active}\n`;
        });
        
        fs.writeFileSync('jobs_dump.txt', output, 'utf8');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkJobs();
