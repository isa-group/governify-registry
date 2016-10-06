/** MIDDLEWARES **/
var config = require('../config');

/**
 * Middleware to control when an agreement state process is already in progress
 *
 * Examples:
 *
 *   app.use(stateInProgress);
 *
 * @param {RequestObject} req - Object that contains all information of the request
 * @param {ResponseObject} res - Object that contains all information of the response
 * @param {Function} next - The next fuction for the chain
 *
 * @api public
 */
module.exports.stateInProgress = function (req, res, next) {

    config.logger.info('New request to retrieve state for agreement %s', JSON.stringify(req.params.agreement, null, 2));
    if (config.state.agreementsInProgress.indexOf(req.params.agreement) != -1) {
        config.logger.info('Agreement %s status: In-Progress. Ignoring request...', req.params.agreement);
        res.json(new errorModel(202, "Agreement %s status: In-Progress. Try again when the agreement calculation has finished", req.params.agreement));
    } else {
        if (config.statusBouncer) {
            config.state.agreementsInProgress.push(req.params.agreement);
            config.logger.info('Agreement status has been changed to: In-Progress');
        }

        res.on('finish', function () {
            if (config.statusBouncer) {
                config.state.agreementsInProgress.splice(config.state.agreementsInProgress.indexOf(req.params.agreement), 1);
                config.logger.info('Agreement status has been changed to: Idle');
            }
        });

        next();
    }

}
