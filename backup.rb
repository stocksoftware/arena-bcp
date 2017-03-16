require 'rest-client'
require 'yaml'
require 'json'
require 'fileutils'

def get_access_rest_token(config)
  begin
    url = config['sso_auth_url'].to_s
    payload = {
        client_id: config['sso_auth_client_id'].to_s,
        client_secret: config['sso_auth_client_secret'].to_s,
        grant_type: config['sso_auth_grant_type'].to_s,
        username: config['sso_auth_username'].to_s,
        password: config['sso_auth_password'].to_s
    }
    rest_token_response = RestClient.post(url, payload)
    parsed = JSON.parse(rest_token_response.body)
    return parsed['access_token']
  rescue RestClient::ExceptionWithResponse => err
    msg = "Error contacting Security Server for access token: #{err.message}"
    p msg
    raise msg
  end
end

def create_file(path)
  dir = File.dirname(path)

  unless File.directory?(dir)
    FileUtils.mkdir_p(dir)
  end

  return File.new(path, 'w')
end

def connect_to_service (config, token, usb_path)
  arena_rest_root_api_url = config['arena_rest_api_root_url']
  config['arena_apis'].each do |api|
    begin
      api_properties = api[1]
      url = arena_rest_root_api_url + api_properties['url']
      arena_response = RestClient::Request.execute(method: :get,
                                                   url: url,
                                                   headers: {
                                                       authorization: token.to_s,
                                                       x_version: api_properties['version'].to_s
                                                   },
                                                   content_type: :json)
      file_path = usb_path + '/data/' + api_properties['file_name']
      out_file = create_file(file_path)
      out_file.puts(arena_response.body)
      out_file.close
      p file_path + ' created.'
    rescue RestClient::ExceptionWithResponse => err
      msg = "Error connecting to Arena with URL = #{url}: #{err.message}"
      p msg
      raise msg
    end
  end
end

def report_completion (config, status, git_revision, message)
  url = "#{config['arena_rest_api_root_url']}#{config['report_completion_url']}"

  begin
    payload = {
        box: config['box_identifier'],
        status: status,
        rev: git_revision,
        message: message
    }
    headers = {
        x_version: config['report_completion_version'].to_s
    }

    RestClient.post(url, payload, headers)

  rescue RestClient::ExceptionWithResponse => err
    msg = "Error connecting to Arena with URL = #{url}: #{err.message}"
    p msg
    raise msg
  end
end

p "Starting backup."

usb_path = ARGV[0]
p "USB Path = #{usb_path}"

common_config_file = ARGV[1]
p "Common Config = #{common_config_file}"

local_config_file = ARGV[2]
p "Local Config = #{local_config_file}"

config = YAML::load_file(common_config_file)
config.merge!(YAML::load_file(local_config_file))

git_revision = `git rev-parse --short master`.strip
p "GIT revision = #{git_revision}"

p "Connecting to ARENA ..."
begin
  token = get_access_rest_token(config)
  connect_to_service(config, token, usb_path)
  report_completion(config, "OK", git_revision, "")
rescue => err
  report_completion(config, "ERROR", git_revision, err.message)
end

p "Backup complete."
