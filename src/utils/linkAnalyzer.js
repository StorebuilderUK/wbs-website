/**
 * Smart Internal Linking System
 * Analyzes content and suggests contextual internal links
 */

// Extract keywords from text
export function extractKeywords(text) {
  // Remove HTML tags and special characters
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/[^\w\s]/g, ' ').toLowerCase();
  
  // Common stop words to ignore
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this',
    'it', 'from', 'be', 'are', 'been', 'was', 'were', 'being'
  ]);
  
  // Extract words and count frequency
  const words = cleanText.split(/\s+/).filter(word => 
    word.length > 3 && !stopWords.has(word)
  );
  
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// Find potential link opportunities in content
export function findLinkOpportunities(content, allPosts, currentSlug) {
  const opportunities = [];
  const keywords = extractKeywords(content);
  
  // Check each post for relevance
  allPosts.forEach(post => {
    if (post.slug === currentSlug) return; // Skip current post
    
    const postKeywords = [
      ...extractKeywords(post.data.title),
      ...extractKeywords(post.data.description),
      ...(post.data.tags || []).map(tag => tag.toLowerCase())
    ];
    
    // Calculate relevance score
    const commonKeywords = keywords.filter(kw => postKeywords.includes(kw));
    const relevanceScore = commonKeywords.length;
    
    if (relevanceScore > 0) {
      // Find best anchor text opportunities in content
      const anchorOpportunities = findAnchorTextOpportunities(content, post, commonKeywords);
      
      if (anchorOpportunities.length > 0) {
        opportunities.push({
          post,
          relevanceScore,
          commonKeywords,
          anchorOpportunities
        });
      }
    }
  });
  
  // Sort by relevance and return top opportunities
  return opportunities
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

// Find potential anchor text in content
function findAnchorTextOpportunities(content, targetPost, keywords) {
  const opportunities = [];
  const sentences = content.split(/[.!?]+/);
  
  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase();
    
    // Check if sentence contains relevant keywords
    const matchingKeywords = keywords.filter(kw => lowerSentence.includes(kw));
    
    if (matchingKeywords.length > 0) {
      // Find potential anchor phrases
      const anchorPhrases = findAnchorPhrases(sentence, matchingKeywords, targetPost.data.title);
      
      anchorPhrases.forEach(phrase => {
        opportunities.push({
          sentence: sentence.trim(),
          sentenceIndex: index,
          anchorText: phrase,
          targetUrl: `/blog/${targetPost.slug}`,
          targetTitle: targetPost.data.title
        });
      });
    }
  });
  
  return opportunities.slice(0, 3); // Max 3 suggestions per target post
}

// Find natural anchor phrases in a sentence
function findAnchorPhrases(sentence, keywords, targetTitle) {
  const phrases = [];
  const words = sentence.split(/\s+/);
  
  // Look for keyword phrases (2-4 words)
  for (let i = 0; i < words.length; i++) {
    for (let len = 2; len <= 4 && i + len <= words.length; len++) {
      const phrase = words.slice(i, i + len).join(' ');
      const lowerPhrase = phrase.toLowerCase();
      
      // Check if phrase contains a keyword and sounds natural
      if (keywords.some(kw => lowerPhrase.includes(kw)) && 
          isNaturalAnchorText(phrase)) {
        phrases.push(phrase);
      }
    }
  }
  
  // Also consider using part of the target title if it appears
  const titleWords = targetTitle.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
  if (sentence.toLowerCase().includes(titleWords)) {
    const regex = new RegExp(titleWords, 'gi');
    const match = sentence.match(regex);
    if (match) phrases.push(match[0]);
  }
  
  return [...new Set(phrases)].slice(0, 2); // Remove duplicates, max 2
}

// Check if anchor text sounds natural
function isNaturalAnchorText(text) {
  // Avoid anchors that are too short or just function words
  if (text.split(' ').length < 2) return false;
  
  // Avoid anchors starting/ending with common words
  const badStarts = ['and', 'or', 'but', 'the', 'a', 'an'];
  const badEnds = ['and', 'or', 'but', 'of', 'in', 'to'];
  
  const words = text.toLowerCase().split(' ');
  if (badStarts.includes(words[0]) || badEnds.includes(words[words.length - 1])) {
    return false;
  }
  
  return true;
}

// Generate link insertion code
export function generateLinkInsertionCode(opportunity) {
  const { sentence, anchorText, targetUrl, targetTitle } = opportunity;
  
  // Create the new sentence with link
  const linkedSentence = sentence.replace(
    anchorText,
    `<a href="${targetUrl}" title="${targetTitle}">${anchorText}</a>`
  );
  
  return {
    original: sentence,
    updated: linkedSentence,
    markdown: sentence.replace(
      anchorText,
      `[${anchorText}](${targetUrl} "${targetTitle}")`
    )
  };
}