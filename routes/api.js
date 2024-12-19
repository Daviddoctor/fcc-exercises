'use strict';

let issues = {};

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      //res.json(issues[project] || [])
      const filters = req.query;
      let fiteredIssues = issues[project] || [];

      if (Object.keys(filters).length > 0) {
        fiteredIssues = fiteredIssues.filter(issue => {
          return Object.keys(filters).every(key => {
            return issue[key] == filters[key];
          });
        });
      }
      res.json(fiteredIssues);
    })

    .post(function (req, res) {
      let project = req.params.project;
      try {
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body
        if (!issue_title?.trim() || !issue_text?.trim() || !created_by?.trim()) {
          return res.status(400).json({ error: 'required field(s) missing' });
        }

        const newIssue = {
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true,
          _id: Math.random().toString(36).substring(2, 9)
        };
        console.log('Nuevo problema:', newIssue);
        if (!issues[project]) {
          issues[project] = []
        }
        issues[project].push(newIssue)

        res.status(201).json(newIssue);
      } catch (error) {
        throw error;
      }

    })

    .put(function (req, res) {
      let project = req.params.project;
      const { _id, ...update } = req.body;

      if (!_id) {
        return res.status(400).json({ error: 'missing _id' });
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({ error: 'no update field(s) sent', '_id': _id });
      }

      let issue = issues[project].find(issue => issue._id === _id);

      if (!issue) {
        return res.status(400).json({ error: 'could not update', '_id': _id });
      }

      issue = { ...issue, ...update, updated_on: new Date() };
      console.log('Issue:', issue);
      res.json({ result: 'successfully updated', '_id': _id });

    })

    .delete(function (req, res) {
      let project = req.params.project;

    });

};
