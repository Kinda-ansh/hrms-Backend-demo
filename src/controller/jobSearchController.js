/**
 * DashboardController.js
 * Created API for Dashboard API
 */

// const dbService = require("../utils/dbServices");
const PrivateJobs = require("../model/Jobs/Privatejobs");
const GovJobs = require("../model/Jobs/Governmentjobs");

/**
 * @description : get Web Home Dashboard in mongodb collection.
 * @param {Object} res : response of all Dashboard
 * @return {Object} : all Dashboard. {status, message, data}
 */

// const jobSearch = async (req, res) => {
//   try {
//     const { jobtitle } = req.query;

//     // Check for missing query parameters
//     if (!jobtitle) {
//       return res
//         .status(400)
//         .send({ message: "Please provide job title to search" });
//     }

//     // Initialize search criteria
//     const searchCriteria = {};

//     // Identify keywords and phrases
//     if (jobtitle) {
//       const regex = new RegExp(jobtitle, "i"); 
//       searchCriteria.jobtitle = { $regex: regex };
//     }


//     // Perform the search in parallel
//     const [govJobs, pvtJobs] = await Promise.all([
//       GovJobs.find(searchCriteria),
//       PrivateJobs.find(searchCriteria),
//     ]);

//     // Check if no results are found
//     if (govJobs.length === 0 && pvtJobs.length === 0) {
//       return res.status(404).send({ message: "No result founded!" });
//     }

//     // Send the results
//     res.send({ govJobs, pvtJobs });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// };

const jobSearch = async (req, res) => {
    try {
      const { jobtitle } = req.query;
  
      // Check for missing query parameters
      if (!jobtitle) {
        return res
          .status(400)
          .send({ message: "Please provide job title to search" });
      }
  
      // Initialize search criteria
      const searchCriteria = {};
  
      // Handle spaces in jobtitle by creating a regex pattern
      if (jobtitle) {
        const words = jobtitle.split(' ').filter(word => word.length > 0); 
        const regexPattern = words.map(word => `(?=.*${word})`).join('');
        const regex = new RegExp(regexPattern, 'i'); 
        searchCriteria.jobtitle = { $regex: regex };
      }
  
      const [govJobs, pvtJobs] = await Promise.all([
        GovJobs.find(searchCriteria),
        PrivateJobs.find(searchCriteria),
      ]);
  
      // Check if no results are found
      if (govJobs.length === 0 && pvtJobs.length === 0) {
        return res.status(404).send({ message: "No result founded!" });
      }
  
      // Send the results
      res.send({ govJobs, pvtJobs });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  };
  

module.exports = {
  jobSearch,
};
