"use strict";
//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
let mongoose = require("mongoose");
let Course = require('../models/Course');
let Professor = require('../models/Professor');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

var test_course = 'Micro-Economics Supplement And Business'


chai.use(chaiHttp);
//Our parent block
describe('Search', () => {
  before((done) => {
    Professor.findOne({}, function(err, result){
      var course = new Course({name: test_course, professor: result});
      course.save(function(err){
        done();
      }); 
    })
    
  });

  /*
  * Test the /GET/: /search?q= course name
  */
  describe('/GET/:course name', () => {
    it('it should GET a course by the given name', (done) => {
        chai.request(server)
        .get('/search')
        .query({q : 'Micro-Economics Supplement'})
        .end((err, res) => {
          res.body.should.be.a('array');
          res.body[0].courses.should.be.a('array');
          res.body[0].courses[0].course_name.should.have.contain('Micro-Economics Supplement');
          done();
        });
    });
  });
   /*
  * Test the /GET/: /search?q= professor name
  */
  describe('/GET/:professor name', () => {
    it('it should GET a professor info by the given name', (done) => {
        chai.request(server)
        .get('/search')
        .query({q : 'Aquadro'})
        .end((err, res) => {
          res.body.should.be.a('array');
          res.body[0].courses.should.be.a('array');
          res.body[0].professor_name.should.have.contain('Aquadro');
          done();
        });
    });
  });
});





