/**
 * common.js
 * @description: exports helper methods for project.
 */

const mongoose = require("mongoose");
const dbService = require("./dbServices");
const dayjs = require("dayjs")
const localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(localizedFormat)
/**
 * convertObjectToEnum : converts object to enum
 * @param {Object} obj : object to be converted
 * @return {Array} : converted Array
 */
function convertObjectToEnum(obj) {
  const enumArr = [];
  Object.values(obj).map((val) => enumArr.push(val));
  return enumArr;
}

/**
 * randomNumber : generate random numbers for given length
 * @param {number} length : length of random number to be generated (default 4)
 * @return {number} : generated random number
 */
function randomNumber(length = 6) {
  const numbers = "12345678901234567890";
  let result = "";
  for (let i = length; i > 0; i -= 1) {
    result += numbers[Math.round(Math.random() * (numbers.length - 1))];
  }
  return result;
}

/**
 * replaceAll: find and replace all occurrence of a string in a searched string
 * @param {string} string  : string to be replace
 * @param {string} search  : string which you want to replace
 * @param {string} replace : string with which you want to replace a string
 * @return {string} : replaced new string
 */
function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

/**
 * uniqueValidation: check unique validation while user registration
 * @param {Object} model : mongoose model instance of collection
 * @param {Object} data : data, coming from request
 * @return {boolean} : validation status
 */
async function uniqueValidation(Model, data) {
  let filter = { $or: [] };
  if (data && data["username"]) {
    filter["$or"].push(
      { username: data["username"] },
      { email: data["username"] }
    );
  }
  if (data && data["email"]) {
    filter["$or"].push({ username: data["email"] }, { email: data["email"] });
  }
  filter.isActive = true;
  filter.isDeleted = false;
  let found = await dbService.findOne(Model, filter);
  if (found) {
    return false;
  }
  return true;
}

/**
 * getDifferenceOfTwoDatesInTime : get difference between two dates in time
 * @param {date} currentDate  : current date
 * @param {date} toDate  : future date
 * @return {string} : difference of two date in time
 */
function getDifferenceOfTwoDatesInTime(currentDate, toDate) {
  let hours = toDate.diff(currentDate, "hour");
  currentDate = currentDate.add(hours, "hour");
  let minutes = toDate.diff(currentDate, "minute");
  currentDate = currentDate.add(minutes, "minute");
  let seconds = toDate.diff(currentDate, "second");
  currentDate = currentDate.add(seconds, "second");
  if (hours) {
    return `${hours} hour, ${minutes} minute and ${seconds} second`;
  }
  return `${minutes} minute and ${seconds} second`;
}



/**
 * getSelectObject : to return a object of select from string, array
 * @param {string || array || object} select : selection attributes
 * @returns {object} : object of select to be passed with filter
 */
function getSelectObject(select) {
  let selectArray = [];
  if (typeof select === "string") {
    selectArray = select.split(" ");
  } else if (Array.isArray(select)) {
    selectArray = select;
  } else if (typeof select === "object") {
    return select;
  }
  let selectObject = {};
  if (selectArray.length) {
    for (let index = 0; index < selectArray.length; index += 1) {
      const element = selectArray[index];
      if (element.startsWith("-")) {
        Object.assign(selectObject, { [element.substring(1)]: -1 });
      } else {
        Object.assign(selectObject, { [element]: 1 });
      }
    }
  }
  return selectObject;
}

/**
 * checkUniqueFieldsInDatabase: check unique fields in database for insert or update operation.
 * @param {Object} model : mongoose model instance of collection
 * @param {Array} fieldsToCheck : array of fields to check in database.
 * @param {Object} data : data to insert or update.
 * @param {String} operation : operation identification.
 * @param {Object} filter : filter for query.
 * @return {Object} : information about duplicate fields.
 */
const checkUniqueFieldsInDatabase = async (
  model,
  fieldsToCheck,
  data,
  operation,
  filter = {}
) => {
  switch (operation) {
    case "INSERT":
      for (const field of fieldsToCheck) {
        //Add unique field and it's value in filter.
        let query = {
          ...filter,
          [field]: data[field],
        };
        let found = await dbService.findOne(model, query);
        if (found) {
          return {
            isDuplicate: true,
            field: field,
            value: data[field],
          };
        }
      }
      break;
    case "BULK_INSERT":
      for (const dataToCheck of data) {
        for (const field of fieldsToCheck) {
          //Add unique field and it's value in filter.
          let query = {
            ...filter,
            [field]: dataToCheck[field],
          };
          let found = await dbService.findOne(model, query);
          if (found) {
            return {
              isDuplicate: true,
              field: field,
              value: dataToCheck[field],
            };
          }
        }
      }
      break;
    case "UPDATE":
    case "BULK_UPDATE":
      let existData = await dbService.findMany(model, filter, {
        select: ["_id"],
      });
      for (const field of fieldsToCheck) {
        if (Object.keys(data).includes(field)) {
          if (existData && existData.length > 1) {
            return {
              isDuplicate: true,
              field: field,
              value: data[field],
            };
          } else if (existData && existData.length === 1) {
            let found = await dbService.findOne(model, {
              [field]: data[field],
            });
            if (found && existData[0]._id.toJSON() !== found._id.toJSON()) {
              return {
                isDuplicate: true,
                field: field,
                value: data[field],
              };
            }
          }
        }
      }
      break;
    case "REGISTER":
      for (const field of fieldsToCheck) {
        //Add unique field and it's value in filter.
        let query = {
          ...filter,
          [field]: data[field],
        };
        let found = await dbService.findOne(model, query);
        if (found) {
          return {
            isDuplicate: true,
            field: field,
            value: data[field],
          };
        }
      }
      /*
       * cross field validation required when login with multiple fields are present,
       * to prevent wrong user logged in.
       */

      if (data && data["username"]) {
        let loginFieldFilter = { $or: [] };
        loginFieldFilter["$or"].push(
          { username: data["username"] },
          { email: data["username"] }
        );
        loginFieldFilter.isActive = true;
        loginFieldFilter.isDeleted = false;
        let found = await dbService.findOne(model, loginFieldFilter);
        if (found) {
          return {
            isDuplicate: true,
            field: "username and email",
            value: data["username"],
          };
        }
      }
      if (data && data["email"]) {
        let loginFieldFilter = { $or: [] };
        loginFieldFilter["$or"].push(
          { username: data["email"] },
          { email: data["email"] }
        );
        loginFieldFilter.isActive = true;
        loginFieldFilter.isDeleted = false;
        let found = await dbService.findOne(model, loginFieldFilter);
        if (found) {
          return {
            isDuplicate: true,
            field: "username and email",
            value: data["email"],
          };
        }
      }
      break;
    default:
      return { isDuplicate: false };
  }
  return { isDuplicate: false };
};

const dateTimeConversion = (timestamp) => {
  const dateTime = dayjs(timestamp);

  // Calculate the difference in seconds, minutes, and hours
  const secondsAgo = dayjs().diff(dateTime, 'second');
  const minutesAgo = dayjs().diff(dateTime, 'minute');
  const hoursAgo = dayjs().diff(dateTime, 'hour');

  // Format the date as "today," "yesterday," or "X seconds/minutes/hours ago"
  let formattedDate;

  if (secondsAgo < 60) {
    formattedDate = `${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`;
  } else if (minutesAgo < 60) {
    formattedDate = `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
  } else if (hoursAgo < 24) {
    formattedDate = `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
  } else if (dateTime.isSame(dayjs(), 'day')) {
    formattedDate = 'today';
  } else if (dateTime.isSame(dayjs().subtract(1, 'day'), 'day')) {
    formattedDate = 'yesterday';
  } else {
    formattedDate = dateTime.format('DD MMM, YYYY h:mm A');
  }

  console.log(formattedDate);
}


const formatViews = (views) => {
  if (views >= 1000 && views < 1000000) {
    return `${Math.floor(views / 1000)}k+`;
  } else if (views >= 1000000) {
    return `${Math.floor(views / 1000000)}M+`;
  }
  return `${views}`;
};


module.exports = {
  convertObjectToEnum,
  randomNumber,
  replaceAll,
  uniqueValidation,
  getDifferenceOfTwoDatesInTime,
  getSelectObject,
  checkUniqueFieldsInDatabase,
  dateTimeConversion,
  formatViews
};