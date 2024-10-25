import transactionService from "./services/transactionService";

(async () => {

    const result = await transactionService.getAllByUser("14cfbeb2-0dbb-42cf-80ac-cc5c904ab22a", 1, 10, "day");
    console.log(result);

})();   