import AccountJobService from "../../services/accountJobService";
import cron from 'node-cron';

    cron.schedule( "0 0 * * *", async () => {
        console.log("Starting scheduled account processing job");
        try {
            await AccountJobService.processApprovedRequests();
        } catch (error) {
            console.error("Scheduled job failed:", error);
        }
    });
