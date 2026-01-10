const DiagnosticFlow = require('../models/DiagnosticFlow');

/**
 * Diagnostic Controller - Intelligent problem diagnosis
 */
class DiagnosticController {
  /**
   * Get all available diagnostic problems by category
   */
  async getAvailableProblems(req, res) {
    try {
      const { category } = req.query;

      const query = { isActive: true };
      if (category) {
        query.serviceCategory = category;
      }

      const problems = await DiagnosticFlow.find(query)
        .select('serviceCategory problemName')
        .sort({ serviceCategory: 1, problemName: 1 });

      // Group by category
      const grouped = problems.reduce((acc, problem) => {
        if (!acc[problem.serviceCategory]) {
          acc[problem.serviceCategory] = [];
        }
        acc[problem.serviceCategory].push({
          id: problem._id,
          name: problem.problemName
        });
        return acc;
      }, {});

      res.json({
        success: true,
        data: grouped
      });
    } catch (error) {
      console.error('Error getting problems:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get diagnostic problems'
      });
    }
  }

  /**
   * Start a diagnostic session for a specific problem
   */
  async startDiagnostic(req, res) {
    try {
      const { problemId } = req.params;

      const flow = await DiagnosticFlow.findOne({
        _id: problemId,
        isActive: true
      });

      if (!flow) {
        return res.status(404).json({
          success: false,
          message: 'Diagnostic flow not found'
        });
      }

      // Return the first question
      const firstQuestion = flow.questions[0];

      res.json({
        success: true,
        data: {
          problemId: flow._id,
          problemName: flow.problemName,
          serviceCategory: flow.serviceCategory,
          question: firstQuestion,
          questionNumber: 1,
          totalQuestions: flow.questions.length
        }
      });
    } catch (error) {
      console.error('Error starting diagnostic:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start diagnostic'
      });
    }
  }

  /**
   * Submit answer and get next question or diagnosis
   */
  async submitAnswer(req, res) {
    try {
      const { problemId } = req.params;
      const { answers } = req.body; // Map of questionId to answer

      const flow = await DiagnosticFlow.findOne({
        _id: problemId,
        isActive: true
      });

      if (!flow) {
        return res.status(404).json({
          success: false,
          message: 'Diagnostic flow not found'
        });
      }

      // Find the next unanswered question
      const answeredQuestionIds = Object.keys(answers);
      const nextQuestion = flow.questions.find(q => !answeredQuestionIds.includes(q.id) && q.required);

      // If there are more questions, return the next one
      if (nextQuestion) {
        const questionNumber = answeredQuestionIds.length + 1;

        return res.json({
          success: true,
          data: {
            hasNextQuestion: true,
            question: nextQuestion,
            questionNumber,
            totalQuestions: flow.questions.length
          }
        });
      }

      // All questions answered - generate diagnosis
      const diagnosis = this.generateDiagnosis(flow, answers);

      res.json({
        success: true,
        data: {
          hasNextQuestion: false,
          diagnosis
        }
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process answer'
      });
    }
  }

  /**
   * Generate diagnosis based on answers
   */
  generateDiagnosis(flow, answers) {
    const result = {
      problemSummary: '',
      urgency: 'routine',
      hasDIYSolution: false,
      diySolution: null,
      needsProfessional: false,
      technicianPrep: null,
      recommendations: []
    };

    // Check urgency indicators
    let maxUrgency = 'routine';
    const urgencyLevels = ['routine', 'urgent', 'emergency'];

    for (const indicator of flow.urgencyIndicators || []) {
      if (answers[indicator.questionId] === indicator.answerValue) {
        const currentLevel = urgencyLevels.indexOf(maxUrgency);
        const newLevel = urgencyLevels.indexOf(indicator.urgency);
        if (newLevel > currentLevel) {
          maxUrgency = indicator.urgency;
        }
      }
    }

    result.urgency = maxUrgency;

    // Check for DIY solutions
    for (const diy of flow.diySolutions || []) {
      let match = true;
      for (const [questionId, answerValue] of diy.condition.entries()) {
        if (answers[questionId] !== answerValue) {
          match = false;
          break;
        }
      }

      if (match) {
        result.hasDIYSolution = true;
        result.diySolution = diy;
        result.needsProfessional = false;
        result.recommendations.push('DIY', 'cost-effective', 'quick-fix');
        break;
      }
    }

    // If no DIY match, check if any answer suggests DIY is possible
    if (!result.hasDIYSolution) {
      for (const question of flow.questions) {
        for (const option of question.options || []) {
          if (option.isDIYCandidate && answers[question.id] === option.value) {
            result.hasDIYSolution = true;
            result.recommendations.push('consider-DIY');
            break;
          }
        }
      }
    }

    // Determine if professional help is needed
    if (!result.hasDIYSolution || result.urgency === 'emergency' || result.urgency === 'urgent') {
      result.needsProfessional = true;
      result.technicianPrep = flow.technicianPreparation;
      result.recommendations.push('professional-help');
    }

    // Generate problem summary
    result.problemSummary = this.generateSummary(flow, answers);

    return result;
  }

  /**
   * Generate a human-readable summary of the problem
   */
  generateSummary(flow, answers) {
    const summaryParts = [];

    for (const question of flow.questions) {
      const answer = answers[question.id];
      if (!answer) continue;

      const option = question.options.find(opt => opt.value === answer);
      if (option) {
        summaryParts.push(`${option.label}`);
      }
    }

    return summaryParts.join(', ');
  }

  /**
   * Search for problems by keyword
   */
  async searchProblems(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query required'
        });
      }

      const problems = await DiagnosticFlow.find({
        isActive: true,
        $or: [
          { problemName: { $regex: q, $options: 'i' } },
          { serviceCategory: { $regex: q, $options: 'i' } }
        ]
      }).select('serviceCategory problemName');

      res.json({
        success: true,
        data: problems
      });
    } catch (error) {
      console.error('Error searching problems:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search problems'
      });
    }
  }
}

module.exports = new DiagnosticController();
