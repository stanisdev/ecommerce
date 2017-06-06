'use strict';

/**
 * Define methods
 */
const exportData = {

   /**
    * Prepare errors while validation entity
    */
   validationErrorsPrepare(output) {
      var errors = [];
      for (let key in output.errors) {
         let element = {};
         element[key] = output.errors[key].message;
         errors.push(element);
      }
      return errors;
   },
};

module.exports = exportData;
