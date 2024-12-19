const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let issueId;
    suite('POST /api/issues/:project', function () {
        test('Create an issue with every field', function (done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Every field',
                    assigned_to: 'Chai and Mocha',
                    status_text: 'In QA'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.isDefined(res.body, 'Issue object is not defined');
                    assert.isObject(res.body);
                    assert.equal(res.body.issue_title, 'Title');
                    assert.equal(res.body.issue_text, 'text');
                    assert.equal(res.body.created_by, 'Functional Test - Every field');
                    assert.equal(res.body.assigned_to, 'Chai and Mocha');
                    assert.equal(res.body.status_text, 'In QA');

                    issueId = res.body._id;
                    
                    done();
                });
        });
        test('Create an issue with only required fields', function (done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Functional Test - Required fields'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.isDefined(res.body, 'Issue object is not defined');
                    assert.isObject(res.body);
                    assert.equal(res.body.issue_title, 'Title');
                    assert.equal(res.body.issue_text, 'text');
                    assert.equal(res.body.created_by, 'Functional Test - Required fields');
                    assert.equal(res.body.assigned_to, '');
                    assert.equal(res.body.status_text, '');
                    done();
                });
        });
        test('Create an issue with missing required fields', async function () {
            try {
                const res = await chai.request(server)
                    .post('/api/issues/test')
                    .send({
                        assigned_to: 'fCC'
                    });
                //assert.equal(res.status, 400);
                assert.isObject(res.body);
                assert.property(res.body, 'error');
                console.log( "error:", typeof res.body);
                console.log( "typeof error:", typeof res.body.error);
                assert.equal(res.body.error, 'required field(s) missing');
            } catch (err) {
                throw new Error(err.response?.text || err.message);
            }
        });
    });

    suite('GET /api/issues/:project', function () {
        test('View issues on a project', function (done) {
            chai.request(server)
                .get('/api/issues/test')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });
        test('View issues on a project with one filter', function (done) {
            chai.request(server)
                .get('/api/issues/test?issue_title=Title')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });
        test('View issues on a project with multiple filters', function (done) {
            chai.request(server)
                .get('/api/issues/test?issue_title=Title&created_by=Functional Test - Every field')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });
    });

    suite('PUT /api/issues/:project', function () {
        test('Update an issue with an _id and one or more fields', function (done) {
            console.log('issueId put:', issueId);
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: issueId,
                    issue_title: 'Updated Title'
                })
                .end(function (err, res) {
                    //assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, 'result');
                    assert.equal(res.body.result, 'successfully updated');
                    done();
                });
        });

        test('Attempt to update an issue without an _id', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    issue_title: 'Updated Title'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 400);
                    assert.isObject(res.body);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });

        test('Attempt to update an issue without fields to update', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: '60a3e0d9'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 400);
                    assert.isObject(res.body);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'no update field(s) sent');
                    done();
                });
        });

        test('Attempt to update an issue with an invalid _id', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: 'Invalid_ID',
                    issue_title: 'Invalid Updated'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 400);
                    assert.isObject(res.body);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'could not update');
                    done();
                });
        });
    });
});
