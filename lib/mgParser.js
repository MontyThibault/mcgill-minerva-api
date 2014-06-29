'use strict';

var cheerio = require('cheerio');

exports.parseTranscript= function(html) {
  var column_map = {
    0: 'RW',
    1: 'Crse',
    2: 'Sec',
    4: 'Credits',
    6: 'Grade', 
    10: 'ClassAvg'  
  };

  var $ = cheerio.load(html);
  var courses = [];
  $('.dataentrytable').find('tr').each(function () {
    var row = {};
    $(this).find('td').each(function (j) {
      if(column_map[j]) 
        row[column_map[j]] = $(this).text();
    });
    if (row.Sec && row.Sec.length === 3) {
      // to mimic course search
      var course = row.Crse.split(' '); 
      row.Subj = course[0];
      row.Crse = course[1]; 
      courses.push(row);
    }
  });  

  return courses;
};

exports.parseCourses = function(raw_html) {
  var column_map = { 
    0: 'isFull',
    1: 'CRN',
    2: 'Subj',
    3: 'Crse',
    4: 'Sec',
    5: 'Type',
    8: 'Days',
    9: 'Time',
    16: 'Instructor',
    19: 'Status',
  };

  var $ = cheerio.load(raw_html);
  var courses = [];
  // some magic sauce
  $('.datadisplaytable').find('tr').each(function () {
    var row = {};
    $(this).find('td').each(function (j) {
      if(column_map[j]) 
        row[column_map[j]] = $(this).text();
    });
    if (row.Subj) {
      if (row.Subj.length === 1) { // hack for when time spans two rows or more
        var last = courses[courses.length - 1];
        last.Days.push(row.Days);
        last.Time.push(row.Time);
      } else {
        row.isFull = (row.isFull === 'C'); // cause on the page its this or a checkbox
        row.Days = [row.Days];
        row.Time = [row.Time];
        courses.push(row);
      }
    }
  });

  return courses; 
};

