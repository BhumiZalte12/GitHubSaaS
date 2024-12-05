"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollCommits = exports.getCommitDetails = exports.octokit = void 0;
var db_1 = require("@/server/db");
var octokit_1 = require("octokit");
var axios_1 = require("axios");
var gemini_1 = require("./gemini");
// Initialize Octokit instance
exports.octokit = new octokit_1.Octokit({
    auth: process.env.GITHUB_TOKEN,
});
// Get commit details from GitHub repository
var getCommitDetails = function (gitHubUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, owner, repo, data, sortedCommits;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = gitHubUrl.split("/").slice(-2), owner = _a[0], repo = _a[1];
                if (!owner || !repo) {
                    throw new Error("Invalid GitHub URL");
                }
                return [4 /*yield*/, exports.octokit.rest.repos.listCommits({
                        owner: owner,
                        repo: repo,
                    })];
            case 1:
                data = (_b.sent()).data;
                sortedCommits = data.sort(function (a, b) {
                    return new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime();
                });
                // Map to required structure and return top 10 commits
                return [2 /*return*/, sortedCommits.slice(0, 10).map(function (commit) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                        return ({
                            commitHash: commit.sha,
                            commitMessage: (_b = (_a = commit.commit) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : "",
                            commitAuthor: (_e = (_d = (_c = commit.commit) === null || _c === void 0 ? void 0 : _c.author) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : "",
                            commitAuthorName: (_g = (_f = commit.author) === null || _f === void 0 ? void 0 : _f.login) !== null && _g !== void 0 ? _g : "",
                            commitAuthorAvatar: (_j = (_h = commit.author) === null || _h === void 0 ? void 0 : _h.avatar_url) !== null && _j !== void 0 ? _j : "",
                            commitDate: (_m = (_l = (_k = commit.commit) === null || _k === void 0 ? void 0 : _k.author) === null || _l === void 0 ? void 0 : _l.date) !== null && _m !== void 0 ? _m : "",
                        });
                    })];
        }
    });
}); };
exports.getCommitDetails = getCommitDetails;
// Poll commits for a project
var pollCommits = function (projectId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, project, gitHubUrl, commitHashes, unprocessedCommits, summaryResponses, summaries, commits;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, fetchProjectGithubUrl(projectId)];
            case 1:
                _a = _b.sent(), project = _a.project, gitHubUrl = _a.gitHubUrl;
                return [4 /*yield*/, (0, exports.getCommitDetails)(gitHubUrl)];
            case 2:
                commitHashes = _b.sent();
                return [4 /*yield*/, filterUnprocessedCommits(projectId, commitHashes)];
            case 3:
                unprocessedCommits = _b.sent();
                return [4 /*yield*/, Promise.allSettled(unprocessedCommits.map(function (commit) { return summariseCommits(gitHubUrl, commit.commitHash); }))];
            case 4:
                summaryResponses = _b.sent();
                summaries = summaryResponses.map(function (response, index) { var _a; return response.status === "fulfilled" ? response.value : "Error for commit ".concat((_a = unprocessedCommits[index]) === null || _a === void 0 ? void 0 : _a.commitHash); });
                return [4 /*yield*/, db_1.db.commit.createMany({
                        data: summaries.map(function (summary, index) { return ({
                            projectId: projectId,
                            commitHash: unprocessedCommits[index].commitHash,
                            commitMessage: unprocessedCommits[index].commitMessage,
                            commitAuthor: unprocessedCommits[index].commitAuthor,
                            commitAuthorName: unprocessedCommits[index].commitAuthorName,
                            commitAuthorAvatar: unprocessedCommits[index].commitAuthorAvatar,
                            commitDate: unprocessedCommits[index].commitDate,
                            summary: summary,
                        }); }),
                    })];
            case 5:
                commits = _b.sent();
                return [2 /*return*/, commits];
        }
    });
}); };
exports.pollCommits = pollCommits;
// Summarize commits
function summariseCommits(gitHubUrl, commitHash) {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get("".concat(gitHubUrl, "/commits/").concat(commitHash, ".diff"), {
                            headers: {
                                Accept: "application/vnd.github.v3.diff",
                            },
                        })];
                case 1:
                    data = (_a.sent()).data;
                    return [4 /*yield*/, (0, gemini_1.aisummariseCommits)(data)];
                case 2: return [2 /*return*/, _a.sent()]; //+
                case 3:
                    error_1 = _a.sent();
                    console.error("Error summarizing commit:", error_1);
                    return [2 /*return*/, "Error summarizing commit"];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Fetch the GitHub URL of a project from the database
function fetchProjectGithubUrl(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var project;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.project.findUnique({
                        where: {
                            id: projectId,
                        },
                        select: {
                            gitHubUrl: true,
                        },
                    })];
                case 1:
                    project = _a.sent();
                    if (!(project === null || project === void 0 ? void 0 : project.gitHubUrl)) {
                        throw new Error("Project has no GitHub URL");
                    }
                    return [2 /*return*/, { project: project, gitHubUrl: project.gitHubUrl }];
            }
        });
    });
}
// Filter unprocessed commits
function filterUnprocessedCommits(projectId, commitHashes) {
    return __awaiter(this, void 0, void 0, function () {
        var processedCommits;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.commit.findMany({
                        where: {
                            projectId: projectId,
                        },
                    })];
                case 1:
                    processedCommits = _a.sent();
                    return [2 /*return*/, commitHashes.filter(function (commit) {
                            return !processedCommits.some(function (processedCommit) { return processedCommit.commitHash === commit.commitHash; });
                        })];
            }
        });
    });
}
// Test the function
(0, exports.pollCommits)("cm49qdu5y00005jbqzl7mz840").then(console.log);
