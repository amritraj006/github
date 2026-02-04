// GitHub Profile Fetcher
import "dotenv/config";

document.addEventListener('DOMContentLoaded', function() {
  // OPTIONAL: GitHub personal access token for higher rate limits.
  // Put your token string below locally and NEVER commit a real token.
  // Example: const GITHUB_TOKEN = "ghp_xxx...";
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  function getAuthHeaders() {
    if (!GITHUB_TOKEN) return {};
    return { Authorization: `Bearer ${GITHUB_TOKEN.trim()}` };
  }
  // DOM Elements
  const usernameInput = document.getElementById('usernameInput');
  const fetchButton = document.getElementById('fetchButton');
  const loader = document.getElementById('loader');
  const errorContainer = document.getElementById('errorContainer');
  const errorMessage = document.getElementById('errorMessage');
  const profileContainer = document.getElementById('profileContainer');
  
  // Profile elements
  const avatar = document.getElementById('avatar');
  const name = document.getElementById('name');
  const login = document.getElementById('login');
  const bio = document.getElementById('bio');
  const location = document.getElementById('location');
  const blog = document.getElementById('blog');
  const twitter = document.getElementById('twitter');
  const company = document.getElementById('company');
  
  // Stats elements
  const followersCount = document.getElementById('followersCount');
  const followingCount = document.getElementById('followingCount');
  const publicRepos = document.getElementById('publicRepos');
  const statRepos = document.getElementById('statRepos');
  const statGists = document.getElementById('statGists');
  const accountAge = document.getElementById('accountAge');
  
  // Bars for visual representation
  const repoBar = document.getElementById('repoBar');
  const gistBar = document.getElementById('gistBar');
  const ageBar = document.getElementById('ageBar');
  
  // Skills and repos containers
  const skillsContainer = document.getElementById('skillsContainer');
  const reposContainer = document.getElementById('reposContainer');
  const repoCount = document.getElementById('repoCount');
  const repoFilterInput = document.getElementById('repoFilterInput');
  const repoPrev = document.getElementById('repoPrev');
  const repoNext = document.getElementById('repoNext');
  const repoPageInfo = document.getElementById('repoPageInfo');

  // Recent searches
  const recentSearchesWrapper = document.getElementById('recentSearchesWrapper');
  const recentSearchesContainer = document.getElementById('recentSearches');
  
  // Sort buttons
  const sortStars = document.getElementById('sortStars');
  const sortUpdate = document.getElementById('sortUpdate');
  
  // Variables to store fetched data
  let userData = null;
  let reposData = [];
  let sortByStars = false;
  let filteredRepos = [];

  const REPOS_PER_PAGE = 3;
  let currentPage = 1;
  const RECENT_KEY = 'github_profile_fetcher_recent';
  
  // Event Listeners
  fetchButton.addEventListener('click', fetchGitHubProfile);
  usernameInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          fetchGitHubProfile();
      }
  });
  
  // Username suggestion click handlers
  document.querySelectorAll('.username-suggestion').forEach(element => {
      element.addEventListener('click', function() {
          usernameInput.value = this.textContent;
          fetchGitHubProfile();
      });
  });
  
  // Sort buttons
  sortStars.addEventListener('click', function() {
      sortByStars = !sortByStars;
      sortStars.innerHTML = sortByStars 
          ? '<i class="fas fa-sort-amount-down mr-1"></i> Sorted by Stars' 
          : '<i class="fas fa-star mr-1"></i> Sort by Stars';
      displayRepositories();
  });
  
  sortUpdate.addEventListener('click', function() {
      sortByStars = false;
      sortStars.innerHTML = '<i class="fas fa-star mr-1"></i> Sort by Stars';
      displayRepositories();
  });

  // Repo filter
  if (repoFilterInput) {
      repoFilterInput.addEventListener('input', function() {
          currentPage = 1;
          displayRepositories();
      });
  }
  
  // Main function to fetch GitHub profile
  async function fetchGitHubProfile() {
      const username = usernameInput.value.trim();
      
      if (!username) {
          showError('Please enter a GitHub username');
          return;
      }
      
      // Reset states
      hideError();
      hideProfile();
      showLoader();
      
      try {
          // Fetch user data (optionally authenticated)
          const userResponse = await fetch(
              `https://api.github.com/users/${username}`,
              { headers: getAuthHeaders() }
          );
          
          if (!userResponse.ok) {
              if (userResponse.status === 404) {
                  throw new Error(`User "${username}" not found on GitHub`);
              } else if (userResponse.status === 403) {
                  throw new Error('GitHub API rate limit exceeded. Try again later.');
              } else {
                  throw new Error(`Error: ${userResponse.status} ${userResponse.statusText}`);
              }
          }
          
          userData = await userResponse.json();
          
          // Fetch user repositories (optionally authenticated)
          const reposResponse = await fetch(
              `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
              { headers: getAuthHeaders() }
          );
          
          if (!reposResponse.ok) {
              throw new Error('Failed to fetch repositories');
          }
          
          reposData = await reposResponse.json();
          // Reset pagination and filtered list
          currentPage = 1;
          filteredRepos = [...reposData];
          
          // Display the data
          displayProfile();
          displayRepositories();
          displaySkills();
          updateRecentSearches(username);
          
      } catch (error) {
          showError(error.message);
      } finally {
          hideLoader();
      }
  }
  
  // Display profile information
  function displayProfile() {
      // Basic info
      avatar.src = userData.avatar_url;
      name.textContent = userData.name || userData.login;
      login.textContent = `@${userData.login}`;
      bio.textContent = userData.bio || 'No bio available';
      
      // Location and contact info
      location.textContent = userData.location || 'Not specified';
      
      if (userData.blog) {
          blog.href = userData.blog.startsWith('http') ? userData.blog : `https://${userData.blog}`;
          blog.textContent = userData.blog.length > 30 ? userData.blog.substring(0, 30) + '...' : userData.blog;
          blog.parentElement.classList.remove('hidden');
      } else {
          blog.parentElement.classList.add('hidden');
      }
      
      if (userData.twitter_username) {
          twitter.textContent = `@${userData.twitter_username}`;
          twitter.parentElement.classList.remove('hidden');
      } else {
          twitter.parentElement.classList.add('hidden');
      }
      
      company.textContent = userData.company || 'Not specified';
      
      // Stats
      followersCount.textContent = userData.followers.toLocaleString();
      followingCount.textContent = userData.following.toLocaleString();
      publicRepos.textContent = userData.public_repos.toLocaleString();
      
      // GitHub stats
      statRepos.textContent = userData.public_repos.toLocaleString();
      statGists.textContent = userData.public_gists.toLocaleString();
      
      // Calculate account age
      const createdDate = new Date(userData.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      accountAge.textContent = `${diffDays.toLocaleString()} days`;
      
      // Animate progress bars
      setTimeout(() => {
          // Normalize values for progress bars (cap at reasonable maximums)
          const repoPercentage = Math.min(userData.public_repos / 50 * 100, 100);
          const gistPercentage = Math.min(userData.public_gists / 20 * 100, 100);
          const agePercentage = Math.min(diffDays / 3650 * 100, 100); // 10 years = 100%
          
          repoBar.style.width = `${repoPercentage}%`;
          gistBar.style.width = `${gistPercentage}%`;
          ageBar.style.width = `${agePercentage}%`;
      }, 100);
      
      // Show profile container
      profileContainer.classList.remove('hidden');
  }
  
  // Display repositories
  function displayRepositories() {
      if (!reposContainer) return;

      // Filter by name
      const filterText = repoFilterInput ? repoFilterInput.value.trim().toLowerCase() : '';
      filteredRepos = reposData.filter(repo =>
          repo.name.toLowerCase().includes(filterText)
      );

      // Update repo count
      repoCount.textContent = filteredRepos.length;

      // Sorting
      let reposToDisplay = [...filteredRepos];
      if (sortByStars) {
          reposToDisplay.sort((a, b) => b.stargazers_count - a.stargazers_count);
      } else {
          // default: by updated time (already from API) but ensure latest first
          reposToDisplay.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      }

      // Pagination
      const total = reposToDisplay.length;
      const totalPages = total === 0 ? 1 : Math.ceil(total / REPOS_PER_PAGE);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const startIndex = (currentPage - 1) * REPOS_PER_PAGE;
      const pageRepos = reposToDisplay.slice(startIndex, startIndex + REPOS_PER_PAGE);

      // Clear current repos
      reposContainer.innerHTML = '';

      if (pageRepos.length === 0) {
          reposContainer.innerHTML = '<div class="text-center text-gray-500 italic py-8">No repositories to display for this filter.</div>';
      }

      // Display each repo (3 per "page")
      pageRepos.forEach(repo => {
          const repoCard = document.createElement('div');
          repoCard.className = 'repo-card bg-white rounded-xl p-5 border border-gray-200';
          
          // Format date
          const updatedDate = new Date(repo.updated_at);
          const formattedDate = updatedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
          });
          
          // Determine language color
          const languageColors = {
              'JavaScript': 'bg-yellow-400',
              'TypeScript': 'bg-blue-500',
              'Python': 'bg-green-500',
              'Java': 'bg-red-500',
              'C++': 'bg-pink-500',
              'Ruby': 'bg-red-700',
              'PHP': 'bg-purple-500',
              'Go': 'bg-cyan-500',
              'Rust': 'bg-orange-600',
              'Swift': 'bg-orange-400',
              'Kotlin': 'bg-purple-600',
              'HTML': 'bg-red-400',
              'CSS': 'bg-blue-400',
              'Shell': 'bg-gray-400'
          };
          
          const langColor = languageColors[repo.language] || 'bg-gray-400';
          
          repoCard.innerHTML = `
              <div class="flex justify-between items-start mb-3">
                  <div class="flex-grow">
                      <div class="flex items-center">
                          <a href="${repo.html_url}" target="_blank" class="text-lg font-bold text-gray-800 hover:text-blue-600 hover:underline mr-2">${repo.name}</a>
                          ${repo.fork ? '<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Fork</span>' : ''}
                          ${repo.private ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Private</span>' : ''}
                      </div>
                      <p class="text-gray-600 text-sm mt-1">${repo.description || 'No description provided'}</p>
                  </div>
              </div>
              
              <div class="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                  ${repo.language ? `
                      <div class="flex items-center">
                          <span class="w-3 h-3 rounded-full ${langColor} mr-1"></span>
                          <span>${repo.language}</span>
                      </div>
                  ` : ''}
                  
                  <div class="flex items-center">
                      <i class="fas fa-star mr-1 text-yellow-500"></i>
                      <span>${repo.stargazers_count.toLocaleString()}</span>
                  </div>
                  
                  <div class="flex items-center">
                      <i class="fas fa-code-branch mr-1 text-blue-500"></i>
                      <span>${repo.forks_count.toLocaleString()}</span>
                  </div>
                  
                  <div class="flex items-center">
                      <i class="fas fa-eye mr-1 text-green-500"></i>
                      <span>${repo.watchers_count.toLocaleString()}</span>
                  </div>
                  
                  <div class="flex items-center ml-auto">
                      <i class="far fa-calendar-alt mr-1"></i>
                      <span>Updated ${formattedDate}</span>
                  </div>
              </div>
          `;
          
          reposContainer.appendChild(repoCard);
      });

      // Update pagination controls
      if (repoPrev && repoNext) {
          repoPrev.disabled = currentPage === 1 || total === 0;
          repoNext.disabled = currentPage === totalPages || total === 0;
      }

      if (repoPageInfo) {
          if (total === 0) {
              repoPageInfo.textContent = 'No repositories found';
          } else {
              const from = startIndex + 1;
              const to = startIndex + pageRepos.length;
              repoPageInfo.textContent = `Showing ${from}–${to} of ${total} repositories (page ${currentPage} of ${totalPages})`;
          }
      }
  }
  
  // Display skills (top languages)
  function displaySkills() {
      // Clear current skills
      skillsContainer.innerHTML = '';
      
      // Count languages from repositories
      const languageCount = {};
      
      reposData.forEach(repo => {
          if (repo.language) {
              languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
          }
      });
      
      // Sort languages by frequency
      const sortedLanguages = Object.entries(languageCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10); // Get top 10 languages
      
      // If no languages found
      if (sortedLanguages.length === 0) {
          skillsContainer.innerHTML = '<div class="text-gray-500 italic">No language data available from repositories</div>';
          return;
      }
      
      // Get max count for scaling
      const maxCount = sortedLanguages[0][1];
      
      // Create skill tags
      sortedLanguages.forEach(([language, count]) => {
          const percentage = (count / maxCount) * 100;
          
          // Determine tag size based on percentage
          let sizeClass = 'text-sm px-3 py-1.5';
          if (percentage > 80) {
              sizeClass = 'text-base px-4 py-2';
          } else if (percentage > 50) {
              sizeClass = 'text-sm px-3.5 py-1.5';
          }
          
          const skillTag = document.createElement('div');
          skillTag.className = `skill-tag ${sizeClass} bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium rounded-full inline-flex items-center mr-2 mb-2`;
          
          // Language icons mapping
          const languageIcons = {
              'JavaScript': 'fab fa-js-square',
              'TypeScript': 'fas fa-code',
              'Python': 'fab fa-python',
              'Java': 'fab fa-java',
              'HTML': 'fab fa-html5',
              'CSS': 'fab fa-css3-alt',
              'PHP': 'fab fa-php',
              'Ruby': 'fab fa-ruby',
              'Go': 'fab fa-golang',
              'Rust': 'fas fa-cog',
              'Swift': 'fab fa-swift',
              'Kotlin': 'fas fa-mobile-alt',
              'C++': 'fas fa-cogs',
              'C#': 'fas fa-code',
              'Shell': 'fas fa-terminal'
          };
          
          const iconClass = languageIcons[language] || 'fas fa-code';
          
          skillTag.innerHTML = `
              <i class="${iconClass} mr-2"></i>
              <span>${language}</span>
              <span class="ml-2 bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">${count}</span>
          `;
          
          skillsContainer.appendChild(skillTag);
      });
  }
  
  // UI Helper Functions
  function showLoader() {
      loader.classList.remove('hidden');
  }
  
  function hideLoader() {
      loader.classList.add('hidden');
  }
  
  function showError(message) {
      errorMessage.textContent = message;
      errorContainer.classList.remove('hidden');
      hideProfile();
  }
  
  function hideError() {
      errorContainer.classList.add('hidden');
  }
  
  function hideProfile() {
      profileContainer.classList.add('hidden');
  }

  // Recent searches helpers
  function loadRecentSearches() {
      try {
          const raw = localStorage.getItem(RECENT_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed : [];
      } catch {
          return [];
      }
  }

  function saveRecentSearches(list) {
      try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(list));
      } catch {
          // ignore
      }
  }

  function renderRecentSearches(list) {
      if (!recentSearchesWrapper || !recentSearchesContainer) return;

      recentSearchesContainer.innerHTML = '';

      if (!list.length) {
          recentSearchesWrapper.classList.add('hidden');
          return;
      }

      list.forEach(username => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium transition';
          chip.textContent = username;
          chip.addEventListener('click', () => {
              usernameInput.value = username;
              fetchGitHubProfile();
          });
          recentSearchesContainer.appendChild(chip);
      });

      recentSearchesWrapper.classList.remove('hidden');
  }

  function updateRecentSearches(username) {
      const trimmed = username.trim();
      if (!trimmed) return;

      let list = loadRecentSearches();
      list = [trimmed, ...list.filter(name => name.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      saveRecentSearches(list);
      renderRecentSearches(list);
  }

  // Initialize recent searches on load
  renderRecentSearches(loadRecentSearches());

  // Pagination button handlers
  if (repoPrev) {
      repoPrev.addEventListener('click', () => {
          if (currentPage > 1) {
              currentPage -= 1;
              displayRepositories();
          }
      });
  }

  if (repoNext) {
      repoNext.addEventListener('click', () => {
          currentPage += 1;
          displayRepositories();
      });
  }
});