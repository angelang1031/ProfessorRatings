"use strict";
var express = require('express');
var router = express.Router();
var async = require('async');
var mongoose = require('mongoose');
var Review = require('../models/Review.js');
var Course = require('../models/Course.js');
var Professor = require('../models/Professor.js');
var Like = require('../models/Like.js');

 /* GET /reviews*/
router.get('/', function(req, res, next) {
//TODO: fix bugs
/* GET /reviews?course_id=x&user_id=XX*/
/*  if (req.query.course_id && req.query.review_id) {
    async.waterfall([
    function getReviews(reviews) {
        Review.find({course: req.query.course_id}, function(err, revs){
          //reviews.json(revs);
        });
    },
    function addLikeUser(reviews, add_result) {
      console.log(reviews);
        for (var i = 0; i < reviews.length; i++) {
          Like.findOne({$and: [{review_id: reviews[i].review_id}, {user_id: req.query.user_id}]}, function(err, likes) {
            console.log(reviews[i]);
            if (err || !likes) reviews[i].set('like', '0');
            else if (likes.like == 1) {
                reviews[i].set('like', '1');
              } else {
                reviews[i].set('like', '0');
              }
          });
        }
        res.json(reviews);
    }
    ], function (error) {
       if (error) {
        //handle readFile error or processFile error here
       }
    });
    return;
  }*/

  /* GET /reviews?course_id=x*/
  if (req.query.course_id) {
    Review.find({course: req.query.course_id }, function(err, revs){
        res.json(revs);
    });
    return;
  }
  //res.send("404", "No such page")
  Review.find(function (err, reviews) {
    if (err) return next(err);
    res.json(reviews);
  });
});

/* POST /reviews */
router.post('/', function(req, res, next) {
  async.waterfall([
    async.constant(req.body),
    function(params, next) {
      Course.findOne({'_id':params.course_id}, function(err, course){
        if(err || course == null) {
          res.json({
            success: false,
            message: 'No course found'
          })
          return;
        }
        var cnt = course.number_of_reviews + 1;
        var avg = (course.number_of_reviews * course.average_review + params.rating) / cnt;
        var quality1 = (course.number_of_reviews * course.quality + params.quality) / cnt;
        var workload1 = (course.number_of_reviews * course.workload + params.workload) / cnt;
        var grading1 = (course.number_of_reviews * course.grading + params.grading) / cnt;
        var workload_count1 = course.workload_count;
        workload_count1[params.workload - 1] += 1;
        var quality_count1 = course.quality_count;
        quality_count1[params.quality - 1] += 1;
        var grading_count1 = course.grading_count;
        grading_count1[params.grading - 1] += 1;

        course.number_of_reviews = cnt;
        course.workload_count = workload_count1;
        course.quality_count = quality_count1;
        course.grading_count = grading_count1;
        course.average_review = avg;
        course.quality = quality1;
        course.workload = workload1;
        course.grading = grading1;
        params.course = course;

        next(null, params);
      })
    },
    function(params, next) {
      var review = new Review(params)
      review.save(function(err){
        if(err) {
          res.json({
            success: false,
            message: 'Unable to create review'
          })
          return;
        }
        next(null, params);
      })
    },
    function(params) {
      params.course.save(function(err, updatedCourse) {
        if(err) {
          res.json({
              success: false,
              message: 'Unable to update course reviews'
          })
        } else {
          res.json({
              success: true,
              message: 'Review submitted successfully'
          })
        }
      })
    }
  ])
});


/* GET /reviews/id */
router.get('/:id', function(req, res, next) {
  Review.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* PUT /reviews/:id */
router.put('/:id', function(req, res, next) {
  Review.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json({success: true});
  });
});

/* DELETE /reviews/:id */
router.delete('/:id', function(req, res, next) {
  Review.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json({success: true});
  });
});

module.exports = router;

